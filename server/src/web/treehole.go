/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-01 14:57:12
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-20 01:59:40
 * @FilePath: \negaihoshi\server\src\web\treehole.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package web

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"negaihoshi/server/config"
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/service"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	redis "github.com/redis/go-redis/v9"
)

type TreeHoleHandler struct {
	svc *service.TreeHoleService
}

func NewTreeHoleHandler(svc *service.TreeHoleService) *TreeHoleHandler {
	return &TreeHoleHandler{
		svc: svc,
	}
}

func (t *TreeHoleHandler) RegisterTreeHoleRoutes(server *gin.Engine) {
	tg := server.Group("/api/treehole")
	tg.POST("/create", t.CreateTreeHoleMessage)
	tg.GET("/list", t.GetTreeHoleMessageList)
	tg.GET("/list/:uid", t.GetUserTreeHoleMessageList)
	tg.GET("/:id", t.GetTreeHoleMessage)
	tg.DELETE("/:id", t.DeleteTreeHoleMessage)
	// 游客配额查询（无须登录）
	tg.GET("/guest-quota", t.GetGuestQuota)
}

// GET /api/treehole/guest-quota
// 返回当日游客配额信息：limit, used, remaining
func (t *TreeHoleHandler) GetGuestQuota(ctx *gin.Context) {
	cfg := config.ConfigFunction{}
	_ = cfg.ReadConfiguration("config/config.json")
	limit := 5
	if cfg.Config.Guest.DailyTreeholeLimit > 0 {
		limit = cfg.Config.Guest.DailyTreeholeLimit
	}

	redisHost, redisPort, redisPwd := cfg.GetRedisConfig()
	addr := fmt.Sprintf("%s:%s", redisHost, redisPort)
	rdb := redis.NewClient(&redis.Options{Addr: addr, Password: redisPwd, DB: 0})
	defer func() { _ = rdb.Close() }()

	ip := ctx.ClientIP()
	now := time.Now()
	dateStr := now.Format("2006-01-02")
	key := fmt.Sprintf("guest:treehole:%s:%s", ip, dateStr)
	c := context.Background()

	val, err := rdb.Get(c, key).Int()
	if err != nil && err != redis.Nil {
		ErrorResponse(ctx, http.StatusInternalServerError, "查询失败")
		return
	}
	used := 0
	if err == nil {
		used = val
	}
	remaining := limit - used
	if remaining < 0 {
		remaining = 0
	}

	SuccessResponse(ctx, map[string]interface{}{
		"limit":     limit,
		"used":      used,
		"remaining": remaining,
	})
}

func (t *TreeHoleHandler) CreateTreeHoleMessage(ctx *gin.Context) {
	type TreeHoleMessageReq struct {
		Content   string `json:"content" binding:"required,min=1,max=1000"`
		Anonymous bool   `json:"anonymous"`
	}

	var req TreeHoleMessageReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "内容不能为空且不超过1000字符")
		return
	}

	sess := sessions.Default(ctx)
	userIdInterface := sess.Get("userId")
	if userIdInterface == nil {
		// 游客：使用 Redis 基于 IP 的每日限额
		cfg := config.ConfigFunction{}
		_ = cfg.ReadConfiguration("config/config.json")
		limit := 5
		if cfg.Config.Guest.DailyTreeholeLimit > 0 {
			limit = cfg.Config.Guest.DailyTreeholeLimit
		}
		// 连接 Redis
		redisHost, redisPort, redisPwd := cfg.GetRedisConfig()
		addr := fmt.Sprintf("%s:%s", redisHost, redisPort)
		rdb := redis.NewClient(&redis.Options{Addr: addr, Password: redisPwd, DB: 0})
		defer func() { _ = rdb.Close() }()

		ip := ctx.ClientIP()
		now := time.Now()
		dateStr := now.Format("2006-01-02")
		key := fmt.Sprintf("guest:treehole:%s:%s", ip, dateStr)
		c := context.Background()

		// 计数并设置在当天结束时过期
		cnt, err := rdb.Incr(c, key).Result()
		if err != nil {
			ErrorResponse(ctx, http.StatusInternalServerError, "计数失败")
			return
		}
		if cnt == 1 {
			// 设置过期到当天 23:59:59
			expireAt := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
			_ = rdb.ExpireAt(c, key, expireAt).Err()
		}
		if int(cnt) > limit {
			// 回滚一次计数，避免超限后继续增长（可选）
			_ = rdb.Decr(c, key).Err()
			ErrorResponse(ctx, http.StatusTooManyRequests, "游客今日发言次数已用完")
			return
		}

		// 发布（游客使用 user_id=0）
		treeholeData := domain.TreeHole{Content: req.Content, UserId: 0}
		if err := t.svc.CreateTreeHoleMessage(ctx, treeholeData); err != nil {
			SystemError(ctx)
			return
		}
		SuccessResponse(ctx, map[string]interface{}{"content": req.Content, "user_id": 0, "message": "发布成功(游客)"}, "发布成功")
		return
	}

	userId := userIdInterface.(int64)
	finalUserId := userId
	if req.Anonymous {
		finalUserId = 0
	}
	treeholeData := domain.TreeHole{
		Content: req.Content,
		UserId:  finalUserId,
	}

	err := t.svc.CreateTreeHoleMessage(ctx, treeholeData)
	if err != nil {
		SystemError(ctx)
		return
	}

	SuccessResponse(ctx, map[string]interface{}{
		"content": req.Content,
		"user_id": finalUserId,
		"message": "发布成功",
	}, "发布成功")
}

func (t *TreeHoleHandler) GetTreeHoleMessageList(ctx *gin.Context) {
	// 使用URL参数而不是JSON body进行分页查询
	pageNumStr := ctx.DefaultQuery("page", "1")
	pageSizeStr := ctx.DefaultQuery("size", "10")

	pageNum := 1
	pageSize := 10

	if num, err := strconv.Atoi(pageNumStr); err == nil && num > 0 {
		pageNum = num
	}
	if size, err := strconv.Atoi(pageSizeStr); err == nil && size > 0 && size <= 50 {
		pageSize = size
	}

	messages, err := t.svc.GetTreeHoleMessageList(ctx, pageNum, pageSize)
	if err != nil {
		SystemError(ctx)
		return
	}

	SuccessResponse(ctx, map[string]interface{}{
		"messages": messages,
		"page":     pageNum,
		"size":     pageSize,
	})
}

func (t *TreeHoleHandler) GetUserTreeHoleMessageList(ctx *gin.Context) {
	type TreeHoleMessageListReq struct {
		PageNum  int `json:"pageNum"`
		PageSize int `json:"pageSize"`
	}
	var req TreeHoleMessageListReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		// ctx.String(http.StatusOK, "系统错误")
		return
	}
	sess := sessions.Default(ctx)
	userId := sess.Get("userId").(int64)
	println(userId)
	mess, err := t.svc.GetUserTreeHoleMessageList(ctx, userId, req.PageNum, req.PageSize)
	if err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	ctx.JSON(http.StatusOK, mess)
}

func (t *TreeHoleHandler) GetTreeHoleMessage(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	mess, err := t.svc.GetTreeHoleMessage(ctx, id)
	if err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	ctx.JSON(http.StatusOK, mess)
}

func (t *TreeHoleHandler) DeleteTreeHoleMessage(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	err = t.svc.DeleteTreeHoleMessage(ctx, id)
	if err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	ctx.String(http.StatusOK, "删除成功")
}
