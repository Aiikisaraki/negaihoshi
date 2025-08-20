package web

import (
	"net/http"
	"strconv"

	"negaihoshi/server/src/service"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type InteractionHandler struct {
	svc *service.InteractionService
}

func NewInteractionHandler(svc *service.InteractionService) *InteractionHandler {
	return &InteractionHandler{svc: svc}
}

func (h *InteractionHandler) RegisterRoutes(server *gin.Engine) {
	g := server.Group("/api/interact")
	g.POST("/like", h.Like)
	g.DELETE("/like", h.Unlike)
	g.GET("/likes/count", h.CountLikes)
	g.GET("/likes/is-liked", h.IsLiked)

	g.POST("/comment", h.AddComment)
	g.GET("/comments", h.ListComments)

	g.POST("/follow", h.Follow)
	g.DELETE("/follow", h.Unfollow)
	g.GET("/followers/count", h.CountFollowers)
	g.GET("/following/count", h.CountFollowing)
}

func (h *InteractionHandler) currentUserId(c *gin.Context) (int64, bool) {
	sess := sessions.Default(c)
	id := sess.Get("userId")
	if id == nil {
		UnauthorizedError(c)
		return 0, false
	}
	switch v := id.(type) {
	case int64:
		return v, true
	case int:
		return int64(v), true
	case string:
		if n, err := strconv.ParseInt(v, 10, 64); err == nil {
			return n, true
		}
	}
	UnauthorizedError(c)
	return 0, false
}

func (h *InteractionHandler) Like(c *gin.Context) {
	var req struct {
		ContentId int64 `json:"content_id" binding:"required"`
		IsPost    bool  `json:"is_post"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		ValidationError(c, "参数错误")
		return
	}
	uid, ok := h.currentUserId(c)
	if !ok {
		return
	}
	// 使用唯一插入实现每个用户仅可点赞一次
	err := h.svc.Like(c.Request.Context(), req.ContentId, req.IsPost, uid)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// 返回最新计数与状态
	cnt, _ := h.svc.CountLikes(c.Request.Context(), req.ContentId, req.IsPost)
	SuccessResponse(c, gin.H{"liked": true, "count": cnt}, "点赞成功")
}

func (h *InteractionHandler) Unlike(c *gin.Context) {
	var req struct {
		ContentId int64 `json:"content_id" binding:"required"`
		IsPost    bool  `json:"is_post"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		ValidationError(c, "参数错误")
		return
	}
	uid, ok := h.currentUserId(c)
	if !ok {
		return
	}
	if err := h.svc.Unlike(c.Request.Context(), req.ContentId, req.IsPost, uid); err != nil {
		ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	cnt, _ := h.svc.CountLikes(c.Request.Context(), req.ContentId, req.IsPost)
	SuccessResponse(c, gin.H{"liked": false, "count": cnt}, "已取消点赞")
}

func (h *InteractionHandler) CountLikes(c *gin.Context) {
	contentId, _ := strconv.ParseInt(c.Query("content_id"), 10, 64)
	isPost := c.DefaultQuery("is_post", "false") == "true"
	cnt, err := h.svc.CountLikes(c.Request.Context(), contentId, isPost)
	if err != nil {
		ValidationError(c, err.Error())
		return
	}
	SuccessResponse(c, gin.H{"count": cnt})
}

func (h *InteractionHandler) IsLiked(c *gin.Context) {
	contentId, _ := strconv.ParseInt(c.Query("content_id"), 10, 64)
	isPost := c.DefaultQuery("is_post", "false") == "true"
	uid, ok := h.currentUserId(c)
	if !ok {
		return
	}
	liked, err := h.svc.IsLiked(c.Request.Context(), contentId, isPost, uid)
	if err != nil {
		ValidationError(c, err.Error())
		return
	}
	SuccessResponse(c, gin.H{"liked": liked})
}

func (h *InteractionHandler) AddComment(c *gin.Context) {
	var req struct {
		ContentId int64  `json:"content_id" binding:"required"`
		IsPost    bool   `json:"is_post"`
		Content   string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		ValidationError(c, "参数错误")
		return
	}
	uid, ok := h.currentUserId(c)
	if !ok {
		return
	}
	if err := h.svc.AddComment(c.Request.Context(), req.ContentId, req.IsPost, uid, req.Content); err != nil {
		ValidationError(c, err.Error())
		return
	}
	SuccessResponse(c, gin.H{"ok": true}, "评论成功")
}

func (h *InteractionHandler) ListComments(c *gin.Context) {
	contentId, _ := strconv.ParseInt(c.Query("content_id"), 10, 64)
	isPost := c.DefaultQuery("is_post", "false") == "true"
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	if page <= 0 {
		page = 1
	}
	if size <= 0 {
		size = 20
	}
	items, err := h.svc.ListComments(c.Request.Context(), contentId, isPost, size, (page-1)*size)
	if err != nil {
		ValidationError(c, err.Error())
		return
	}
	SuccessResponse(c, gin.H{"comments": items})
}

func (h *InteractionHandler) Follow(c *gin.Context) {
	var req struct {
		FolloweeId int64 `json:"followee_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		ValidationError(c, "参数错误")
		return
	}
	uid, ok := h.currentUserId(c)
	if !ok {
		return
	}
	if err := h.svc.Follow(c.Request.Context(), uid, req.FolloweeId); err != nil {
		ValidationError(c, err.Error())
		return
	}
	SuccessResponse(c, gin.H{"following": true}, "关注成功")
}

func (h *InteractionHandler) Unfollow(c *gin.Context) {
	var req struct {
		FolloweeId int64 `json:"followee_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		ValidationError(c, "参数错误")
		return
	}
	uid, ok := h.currentUserId(c)
	if !ok {
		return
	}
	if err := h.svc.Unfollow(c.Request.Context(), uid, req.FolloweeId); err != nil {
		ValidationError(c, err.Error())
		return
	}
	SuccessResponse(c, gin.H{"following": false}, "已取消关注")
}

func (h *InteractionHandler) CountFollowers(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.Query("user_id"), 10, 64)
	cnt, err := h.svc.CountFollowers(c.Request.Context(), userId)
	if err != nil {
		ValidationError(c, err.Error())
		return
	}
	SuccessResponse(c, gin.H{"count": cnt})
}

func (h *InteractionHandler) CountFollowing(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.Query("user_id"), 10, 64)
	cnt, err := h.svc.CountFollowing(c.Request.Context(), userId)
	if err != nil {
		ValidationError(c, err.Error())
		return
	}
	SuccessResponse(c, gin.H{"count": cnt})
}
