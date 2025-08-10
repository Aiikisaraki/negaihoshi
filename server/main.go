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
	"context"
	// "encoding/json"
	"fmt"
	"negaihoshi/server/config"
	"negaihoshi/server/src/repository"
	"negaihoshi/server/src/repository/dao"

	// "negaihoshi/server/src/request"
	"negaihoshi/server/src/service"
	"negaihoshi/server/src/web"
	"negaihoshi/server/src/web/middleware"

	// "io"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"

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

	// 测试
	// wpR := request.NewWpRequest()
	// url := "https://blog.kimisui56.work"
	// resp, _ := wpR.TransferPosts(url, 1, "test", "test", "morikawa56", "jwLA 92JR qPwe kUme QzBg CHkZ")
	// body, _ := io.ReadAll(resp.Body)
	// fmt.Println("原始响应:", string(body))
	// var result map[string]interface{}
	// json.Unmarshal(body, &result)
	// fmt.Println("解析后的数据:", result)

	db := initDB(&serverConfig)
	redisClient := initRedis(&serverConfig)
	u, userService := initUser(db, redisClient)
	t, treeholeService := initTreeHole(db)
	s, statusService := initPersonalTextStatus(db)
	apiDocs := initAPIDocsHandler(&serverConfig)
	admin := initAdminHandler(userService, treeholeService, statusService)
	r := initWebServer(&serverConfig)

	// 注册路由
	u.RegisterUserRoutes(r)
	t.RegisterTreeHoleRoutes(r)
	s.RegisterStatusAndPostsRoutes(r)
	apiDocs.RegisterAPIDocsRoutes(r)
	admin.RegisterAdminRoutes(r)

	r.Static("/assets", "./assets")
	r.StaticFile("/favicon.ico", "./assets/favicon.ico")
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
		Build())
	return r
}

func initDB(config *config.ConfigFunction) *gorm.DB {
	_, dbHost, dbPort, dbUser, dbPassword, dbDatabaseName := config.GetDatabaseConfig()
	db, err := gorm.Open(mysql.Open(dbUser + ":" + dbPassword + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbDatabaseName + "?charset=utf8mb4&parseTime=True&loc=Local"))
	if err != nil {
		// panic相当于整个goroutine结束
		panic(err)
	}

	err = dao.InitUserTable(db)
	if err != nil {
		panic(err)
	}
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

func initUser(db *gorm.DB, rc *redis.Client) (*web.UserHandler, *service.UserService) {
	ud := dao.NewUserDAO(db)
	wpud := dao.NewUserWordpressInfoDAO(db)
	repo := repository.NewUserRepository(ud, wpud, rc)
	svc := service.NewUserService(repo)
	return web.NewUserHandler(svc), svc
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

func initRedis(config *config.ConfigFunction) *redis.Client {
	ctx := context.Background()
	redisHost, redisPort, redisPassword := config.GetRedisConfig()
	rdb := redis.NewClient(&redis.Options{
		Addr:     redisHost + ":" + redisPort, // 连接地址和端口,
		Password: redisPassword,               // no password set
		DB:       0,                           // use default DB
	})
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}
	fmt.Println("成功连接redis")
	return rdb
}

func initAPIDocsHandler(config *config.ConfigFunction) *web.APIDocsHandler {
	return web.NewAPIDocsHandler(config)
}

func initAdminHandler(userService *service.UserService, treeholeService *service.TreeHoleService, statusService *service.StatusAndPostsService) *web.AdminHandler {
	return web.NewAdminHandler(userService, treeholeService, statusService)
}
