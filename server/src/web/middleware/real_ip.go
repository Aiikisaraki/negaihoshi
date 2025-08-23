package middleware

import (
	"fmt"
	"negaihoshi/server/src/util"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// RealIPMiddleware 真实IP中间件
type RealIPMiddleware struct {
	config *util.IPConfig
}

// NewRealIPMiddleware 创建真实IP中间件
func NewRealIPMiddleware(config *util.IPConfig) *RealIPMiddleware {
	if config == nil {
		config = util.DefaultIPConfig()
	}
	return &RealIPMiddleware{config: config}
}

// Handle 处理请求，记录真实IP
func (m *RealIPMiddleware) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		// 获取真实IP
		realIP := util.GetRealIP(c.Request, m.config)
		
		// 获取RemoteAddr（可能是代理IP）
		remoteAddr := c.Request.RemoteAddr
		
		// 获取所有相关的IP头信息
		ipHeaders := map[string]string{
			"X-Real-IP":         c.Request.Header.Get("X-Real-IP"),
			"X-Forwarded-For":   c.Request.Header.Get("X-Forwarded-For"),
			"X-Forwarded":       c.Request.Header.Get("X-Forwarded"),
			"X-Client-IP":       c.Request.Header.Get("X-Client-IP"),
			"CF-Connecting-IP":  c.Request.Header.Get("CF-Connecting-IP"),
		}
		
		// 将IP信息存储到上下文中，供后续使用
		c.Set("real_ip", realIP)
		c.Set("remote_addr", remoteAddr)
		c.Set("ip_headers", ipHeaders)
		
		// 记录请求日志
		c.Next()
		
		// 请求完成后记录访问日志
		duration := time.Since(start)
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path
		
		// 记录访问日志（包含真实IP）
		logAccess(c, realIP, remoteAddr, method, path, status, duration, ipHeaders)
	}
}

// logAccess 记录访问日志
func logAccess(c *gin.Context, realIP, remoteAddr, method, path string, status int, duration time.Duration, ipHeaders map[string]string) {
	// 这里可以根据需要记录到日志文件或数据库
	// 示例：记录到控制台
	if status >= 400 {
		// 错误请求记录详细信息
		c.Error(fmt.Errorf("Request failed - RealIP: %s, RemoteAddr: %s, Method: %s, Path: %s, Status: %d, Duration: %v, Headers: %v",
			realIP, remoteAddr, method, path, status, duration, ipHeaders))
	} else {
		// 成功请求记录基本信息
		c.Error(fmt.Errorf("Request success - RealIP: %s, RemoteAddr: %s, Method: %s, Path: %s, Status: %d, Duration: %v",
			realIP, remoteAddr, method, path, status, duration))
	}
}

// GetRealIP 从上下文中获取真实IP
func GetRealIP(c *gin.Context) string {
	if ip, exists := c.Get("real_ip"); exists {
		if realIP, ok := ip.(string); ok {
			return realIP
		}
	}
	return "unknown"
}

// GetRemoteAddr 从上下文中获取远程地址
func GetRemoteAddr(c *gin.Context) string {
	if addr, exists := c.Get("remote_addr"); exists {
		if remoteAddr, ok := addr.(string); ok {
			return remoteAddr
		}
	}
	return "unknown"
}

// GetIPHeaders 从上下文中获取IP头信息
func GetIPHeaders(c *gin.Context) map[string]string {
	if headers, exists := c.Get("ip_headers"); exists {
		if ipHeaders, ok := headers.(map[string]string); ok {
			return ipHeaders
		}
	}
	return make(map[string]string)
}
