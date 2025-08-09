/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-20 20:00:00
 * @Description: WordPress集成相关接口
 */
package web

import (
	"negaihoshi/server/src/service"
	"strconv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type WordPressHandler struct {
	userSvc *service.UserService
	// 后续可以添加专门的WordPress服务
}

func NewWordPressHandler(userSvc *service.UserService) *WordPressHandler {
	return &WordPressHandler{
		userSvc: userSvc,
	}
}

func (w *WordPressHandler) RegisterWordPressRoutes(server *gin.Engine) {
	wpGroup := server.Group("/api/wordpress")
	wpGroup.POST("/bind", w.BindWordPressSite)
	wpGroup.GET("/sites", w.GetBindSites)
	wpGroup.DELETE("/sites/:id", w.UnbindSite)
	wpGroup.POST("/transfer", w.TransferContent)
}

// 绑定WordPress站点
func (w *WordPressHandler) BindWordPressSite(ctx *gin.Context) {
	type BindSiteReq struct {
		SiteURL  string `json:"site_url" binding:"required,url"`
		Username string `json:"username" binding:"required"`
		APIKey   string `json:"api_key" binding:"required"`
		SiteName string `json:"site_name"`
		WPUserID int64  `json:"wp_user_id"`
	}

	var req BindSiteReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "请填写完整的站点信息")
		return
	}

	sess := sessions.Default(ctx)
	userIdInterface := sess.Get("userId")
	if userIdInterface == nil {
		UnauthorizedError(ctx)
		return
	}

	userId := userIdInterface.(int64)

	// 这里应该调用service层来保存WordPress绑定信息
	// 暂时简化处理
	SuccessResponse(ctx, map[string]interface{}{
		"message": "WordPress站点绑定成功",
		"site":    req.SiteURL,
	})
}

// 获取已绑定的站点
func (w *WordPressHandler) GetBindSites(ctx *gin.Context) {
	sess := sessions.Default(ctx)
	userIdInterface := sess.Get("userId")
	if userIdInterface == nil {
		UnauthorizedError(ctx)
		return
	}

	// 这里应该从数据库获取用户绑定的WordPress站点
	// 暂时返回示例数据
	sites := []map[string]interface{}{
		{
			"id":        1,
			"site_url":  "https://example.wordpress.com",
			"site_name": "我的博客",
			"username":  "admin",
			"bind_time": "2025-01-20T10:00:00Z",
		},
	}

	SuccessResponse(ctx, map[string]interface{}{
		"sites": sites,
	})
}

// 解绑站点
func (w *WordPressHandler) UnbindSite(ctx *gin.Context) {
	siteIdStr := ctx.Param("id")
	siteId, err := strconv.ParseInt(siteIdStr, 10, 64)
	if err != nil {
		ValidationError(ctx, "无效的站点ID")
		return
	}

	sess := sessions.Default(ctx)
	userIdInterface := sess.Get("userId")
	if userIdInterface == nil {
		UnauthorizedError(ctx)
		return
	}

	// 这里应该删除绑定关系
	SuccessResponse(ctx, map[string]interface{}{
		"message": "站点解绑成功",
		"site_id": siteId,
	})
}

// 转发内容到WordPress
func (w *WordPressHandler) TransferContent(ctx *gin.Context) {
	type TransferReq struct {
		ContentID    int64   `json:"content_id" binding:"required"`
		ContentType  string  `json:"content_type" binding:"required,oneof=treehole status post"`
		SiteIDs      []int64 `json:"site_ids" binding:"required"`
		Title        string  `json:"title"`         // 可选，用于文章
		AsPrivate    bool    `json:"as_private"`    // 是否设为私有
		AddSignature bool    `json:"add_signature"` // 是否添加签名
	}

	var req TransferReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "请求参数错误")
		return
	}

	sess := sessions.Default(ctx)
	userIdInterface := sess.Get("userId")
	if userIdInterface == nil {
		UnauthorizedError(ctx)
		return
	}

	// 这里应该：
	// 1. 获取原始内容
	// 2. 验证用户权限
	// 3. 遍历目标站点进行转发
	// 4. 记录转发结果

	// 暂时返回成功响应
	SuccessResponse(ctx, map[string]interface{}{
		"message":        "内容转发成功",
		"content_id":     req.ContentID,
		"content_type":   req.ContentType,
		"transferred_to": len(req.SiteIDs),
		"results": []map[string]interface{}{
			{
				"site_id":     req.SiteIDs[0],
				"success":     true,
				"wp_post_id":  123,
				"wp_post_url": "https://example.com/post/123",
			},
		},
	})
}
