/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-07-26 20:27:08
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-06 22:47:55
 * @FilePath: \negaihoshi\server\src\web\middleware\login.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type LoginMiddlewareBuilder struct {
	paths []string
}

func NewLoginMiddlewareBuilder() *LoginMiddlewareBuilder {
	return &LoginMiddlewareBuilder{}
}

func (l *LoginMiddlewareBuilder) IgnorePaths(path string) *LoginMiddlewareBuilder {
	l.paths = append(l.paths, path)
	return l
}

func (l *LoginMiddlewareBuilder) Build() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 添加调试日志
		fmt.Printf("中间件处理请求: %s %s\n", c.Request.Method, c.Request.URL.Path)

		// 不需要登录校验的
		for _, path := range l.paths {
			if c.Request.URL.Path == path {
				fmt.Printf("路径 %s 在忽略列表中，跳过认证\n", c.Request.URL.Path)
				return
			}
		}
		if c.Request.URL.Path == "/api/users/login" || c.Request.URL.Path == "/api/users/signup" {
			fmt.Printf("登录/注册路径 %s，跳过认证\n", c.Request.URL.Path)
			return
		}

		sess := sessions.Default(c)
		id := sess.Get("userId")
		fmt.Printf("Session中的userId: %v\n", id)

		if id == nil {
			// 没有登录
			fmt.Printf("用户未登录，返回401\n")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// 将用户ID设置到上下文中，供后续处理器使用
		c.Set("user_id", id)
		fmt.Printf("用户已认证，userId: %v\n", id)
	}
}
