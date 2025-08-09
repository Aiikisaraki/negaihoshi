/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-20 20:00:00
 * @Description: 统一API响应结构
 */
package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse 统一API响应结构
type APIResponse struct {
	Code    int         `json:"code"`    // 状态码
	Message string      `json:"message"` // 消息
	Data    interface{} `json:"data"`    // 数据
}

// SuccessResponse 成功响应
func SuccessResponse(ctx *gin.Context, data interface{}, message ...string) {
	msg := "操作成功"
	if len(message) > 0 {
		msg = message[0]
	}
	ctx.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: msg,
		Data:    data,
	})
}

// ErrorResponse 错误响应
func ErrorResponse(ctx *gin.Context, code int, message string) {
	ctx.JSON(http.StatusOK, APIResponse{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}

// SystemError 系统错误响应
func SystemError(ctx *gin.Context) {
	ErrorResponse(ctx, 500, "系统错误，请稍后重试")
}

// ValidationError 参数验证错误
func ValidationError(ctx *gin.Context, message string) {
	ErrorResponse(ctx, 400, message)
}

// UnauthorizedError 未授权错误
func UnauthorizedError(ctx *gin.Context) {
	ErrorResponse(ctx, 401, "未授权访问")
}

// ForbiddenError 禁止访问错误
func ForbiddenError(ctx *gin.Context) {
	ErrorResponse(ctx, 403, "权限不足")
}

// NotFoundError 资源不存在错误
func NotFoundError(ctx *gin.Context, resource string) {
	ErrorResponse(ctx, 404, resource+"不存在")
}
