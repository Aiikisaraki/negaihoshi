/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 14:52:22
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-04-22 17:37:54
 * @FilePath: \nekaihoshi\server\main.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package main

import (
	"nekaihoshi/server/src/repository"
	"nekaihoshi/server/src/repository/dao"
	"nekaihoshi/server/src/service"
	"nekaihoshi/server/src/web"
	"nekaihoshi/server/src/web/middleware"
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
	db := initDB()
	u := initUser(db)
	r := initWebServer()
	u.RegisterUserRoutes(r)
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Hi, this is Aii's Private API~")
	})
	r.Static("/assets", "./assets")
	r.StaticFile("/favicon.ico", "./assets/favicon.ico")
	r.Run(":9292")
}

func initWebServer() *gin.Engine {
	r := web.RegisterRoutes()

	r.Use(cors.New(cors.Config{
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			if strings.Contains(origin, "localhost") || strings.Contains(origin, "127.0.0.1") {
				return true
			}
			return strings.HasPrefix(origin, "http://localhost:3000")
		},
		MaxAge: 12 * time.Hour,
	}))
	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("ssid", store))
	r.Use(middleware.NewLoginMiddlewareBuilder().
		IgnorePaths("/users/signup").
		IgnorePaths("/users/login").
		IgnorePaths("/").
		IgnorePaths("/favicon.ico").
		Build())
	return r
}

func initDB() *gorm.DB {
	db, err := gorm.Open(mysql.Open("nekaihoshi:Hrj4EwdNapE3L3bE@tcp(192.168.57.191:3306)/nekaihoshi?charset=utf8mb4&parseTime=True&loc=Local"))
	if err != nil {
		// panic相当于整个goroutine结束
		panic(err)
	}

	err = dao.InitUserTable(db)
	if err != nil {
		panic(err)
	}
	return db
}

func initUser(db *gorm.DB) *web.UserHandler {
	ud := dao.NewUserDAO(db)
	repo := repository.NewUserRepository(ud)
	svc := service.NewUserService(repo)
	return web.NewUserHandler(svc)
}
