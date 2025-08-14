/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 14:52:22
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-10 21:38:06
 * @FilePath: \nekaihoshi\server\main.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package main

import (
	"fmt"
	"negaihoshi/server/config"
	"negaihoshi/server/src/repository"
	"negaihoshi/server/src/repository/dao"
	"negaihoshi/server/src/service"
	"negaihoshi/server/src/util"
	"negaihoshi/server/src/web"
	"negaihoshi/server/src/web/middleware"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	serverConfig, err := initConfig()
	if err != nil {
		panic(err)
	}

	db := initDB(&serverConfig)
	_, userService := initUser(db, &serverConfig.Config)
	t, treeholeService := initTreeHole(db)
	s, statusService := initPersonalTextStatus(db)
	apiDocs := initAPIDocsHandler(&serverConfig)
	admin := initAdminHandler(userService, treeholeService, statusService)
	r := initWebServer(&serverConfig)

	// 注册路由
	// 注意：用户路由已经在 initUser 中注册，这里不需要重复注册
	t.RegisterTreeHoleRoutes(r)
	s.RegisterStatusAndPostsRoutes(r)
	apiDocs.RegisterAPIDocsRoutes(r)
	admin.RegisterAdminRoutes(r)

	r.Static("/assets", "./assets")
	r.StaticFile("/favicon.ico", "./assets/favicon.ico")
	// 注意：uploads静态文件服务已经在initWebServer中配置，这里不需要重复配置
	serverPort := serverConfig.GetServerPort()
	r.Run(":" + serverPort)
}

func initConfig() (config.ConfigFunction, error) {
	configPath := "config/config.json"
	serverConfig := config.ConfigFunction{}

	// 尝试读取配置文件，如果不存在会自动生成
	err := serverConfig.ReadConfiguration(configPath)
	if err != nil {
		fmt.Printf("配置初始化失败: %v\n", err)
		fmt.Println("请检查配置文件或确保项目根目录存在config.json文件")
		return serverConfig, err
	}

	return serverConfig, nil
}

func initWebServer(config *config.ConfigFunction) *gin.Engine {
	r := gin.Default()
	frontendPrefix := config.GetFrontendPrefix()
	r.Use(cors.New(cors.Config{
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			if strings.Contains(origin, "localhost") || strings.Contains(origin, "127.0.0.1") {
				return true
			}
			return strings.HasPrefix(origin, frontendPrefix[0])
		},
		MaxAge: 12 * time.Hour,
	}))
	store := cookie.NewStore([]byte("secret"))
	store.Options(sessions.Options{
		Path:     "/",
		Domain:   "",
		MaxAge:   86400 * 7, // 7 days
		Secure:   false,     // 开发环境设为false
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	r.Use(sessions.Sessions("ssid", store))
	r.Use(middleware.NewLoginMiddlewareBuilder().
		IgnorePaths("/api/users/signup").
		IgnorePaths("/api/users/login").
		IgnorePaths("/").
		IgnorePaths("/favicon.ico").
		IgnorePaths("/api/treehole/list").
		IgnorePaths("/api/treehole/list/*").
		IgnorePaths("/api/docs").
		IgnorePaths("/api/test").
		IgnorePaths("/api/docs/json").
		IgnorePaths("/api/test/execute").
		IgnorePaths("/admin").
		IgnorePaths("/admin/*").
		IgnorePaths("/uploads").
		IgnorePaths("/uploads/*").
		Build())

	// 初始化数据库连接
	db := initDB(config)

	// 初始化用户相关服务并注册路由
	userHandler, _ := initUser(db, &config.Config)
	userHandler.RegisterUserRoutes(r)

	// 添加静态文件服务，用于访问上传的头像
	r.Static("/uploads", "./uploads")

	return r
}

func initDB(config *config.ConfigFunction) *gorm.DB {
	_, dbHost, dbPort, dbUser, dbPassword, dbDatabaseName := config.GetDatabaseConfig()
	db, err := gorm.Open(mysql.Open(dbUser + ":" + dbPassword + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbDatabaseName + "?charset=utf8mb4&parseTime=True&loc=Local"))
	if err != nil {
		// panic相当于整个goroutine结束
		panic(err)
	}

	// 初始化用户表（包含新的个人资料字段）
	err = dao.InitUserTable(db)
	if err != nil {
		panic(err)
	}

	// 初始化其他表
	err = dao.InitUserWordpressInfoTable(db)
	if err != nil {
		panic(err)
	}
	err = dao.InitTreeHoleTable(db)
	if err != nil {
		panic(err)
	}
	return db
}

func initUser(db *gorm.DB, config *config.Config) (*web.UserHandler, *service.UserService) {
	// 从gorm.DB获取底层的sql.DB
	sqlDB, err := db.DB()
	if err != nil {
		panic(err)
	}

	// 初始化密码加密工具（使用配置中的密钥）
	// 这里使用一个默认密钥，实际生产环境应该从配置文件读取
	cryptoKey := []byte("negaihoshi-password-encryption-key-32bytes")
	crypto := util.NewPasswordCrypto(cryptoKey)

	// 初始化存储服务（从配置中读取）
	avatarStorage := service.NewAvatarStorage(config)

	ud := dao.NewUserDAO(sqlDB)
	repo := repository.NewUserRepository(ud)
	svc := service.NewUserService(repo, crypto, avatarStorage)
	return web.NewUserHandler(svc, avatarStorage), svc
}

func initTreeHole(db *gorm.DB) (*web.TreeHoleHandler, *service.TreeHoleService) {
	td := dao.NewTreeHoleDAO(db)
	repo := repository.NewTreeHoleRepository(td)
	svc := service.NewTreeHoleService(repo)
	return web.NewTreeHoleHandler(svc), svc
}

func initPersonalTextStatus(db *gorm.DB) (*web.StatusAndPostsHandler, *service.StatusAndPostsService) {
	sd := dao.NewStatusDAO(db)
	pd := dao.NewPostsDAO(db)
	repo := repository.NewStatusAndPostsRepository(sd, pd)
	svc := service.NewStatusAndPostsService(repo)
	return web.NewStatusAndPostsHandler(svc), svc
}

func initAPIDocsHandler(config *config.ConfigFunction) *web.APIDocsHandler {
	return web.NewAPIDocsHandler(config)
}

func initAdminHandler(userService *service.UserService, treeholeService *service.TreeHoleService, statusService *service.StatusAndPostsService) *web.AdminHandler {
	return web.NewAdminHandler(userService, treeholeService, statusService)
}
