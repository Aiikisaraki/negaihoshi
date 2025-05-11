/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 14:52:22
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-11 11:17:49
 * @FilePath: \nekaihoshi\server\main.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"negaihoshi/server/config"
	"negaihoshi/server/src/repository"
	"negaihoshi/server/src/repository/dao"
	"negaihoshi/server/src/request"
	"negaihoshi/server/src/service"
	"negaihoshi/server/src/web"
	"negaihoshi/server/src/web/middleware"

	"io"
	"net/http"
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
	wpR := request.NewWpRequest()
	resp, _ := wpR.GetWpUserData("https://blog.kimisui56.work", 1)
	body, _ := io.ReadAll(resp.Body)
	fmt.Println("原始响应:", string(body))
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	fmt.Println("解析后的数据:", result)

	db := initDB(&serverConfig)
	redisClient := initRedis(&serverConfig)
	u := initUser(db, redisClient)
	t := initTreeHole(db)
	s := initPersonalTextStatus(db)
	r := initWebServer(&serverConfig)
	u.RegisterUserRoutes(r)
	t.RegisterTreeHoleRoutes(r)
	s.RegisterStatusAndPostsRoutes(r)
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Hi, this is Aii's Private API~")
	})
	r.Static("/assets", "./assets")
	r.StaticFile("/favicon.ico", "./assets/favicon.ico")
	serverPort := serverConfig.GetServerPort()
	r.Run(":" + serverPort)
}

func initConfig() (config.ConfigFunction, error) {
	configPath := "config/config.json"
	serverConfig := config.ConfigFunction{}
	err := serverConfig.ReadConfiguration(configPath)
	return serverConfig, err
}

func initWebServer(config *config.ConfigFunction) *gin.Engine {
	r := web.RegisterRoutes()
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

func initUser(db *gorm.DB, rc *redis.Client) *web.UserHandler {
	ud := dao.NewUserDAO(db)
	wpud := dao.NewUserWordpressInfoDAO(db)
	repo := repository.NewUserRepository(ud, wpud, rc)
	svc := service.NewUserService(repo)
	return web.NewUserHandler(svc)
}

func initTreeHole(db *gorm.DB) *web.TreeHoleHandler {
	td := dao.NewTreeHoleDAO(db)
	repo := repository.NewTreeHoleRepository(td)
	svc := service.NewTreeHoleService(repo)
	return web.NewTreeHoleHandler(svc)
}

func initPersonalTextStatus(db *gorm.DB) *web.StatusAndPostsHandler {
	sd := dao.NewStatusDAO(db)
	pd := dao.NewPostsDAO(db)
	repo := repository.NewStatusAndPostsRepository(sd, pd)
	svc := service.NewStatusAndPostsService(repo)
	return web.NewStatusAndPostsHandler(svc)
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
