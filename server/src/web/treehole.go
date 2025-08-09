/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-01 14:57:12
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-06 22:43:20
 * @FilePath: \negaihoshi\server\src\web\treehole.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package web

import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/service"
	"net/http"
	"strconv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
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
}

func (t *TreeHoleHandler) CreateTreeHoleMessage(ctx *gin.Context) {
	type TreeHoleMessageReq struct {
		Content string `json:"content"`
	}
	var req TreeHoleMessageReq
	if err := ctx.Bind(&req); err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	sess := sessions.Default(ctx)
	userId := sess.Get("userId").(int64)
	err := t.svc.CreateTreeHoleMessage(ctx, domain.TreeHole{
		Content: req.Content,
		UserId:  userId,
	})
	if err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	ctx.String(http.StatusOK, "添加成功")
}

func (t *TreeHoleHandler) GetTreeHoleMessageList(ctx *gin.Context) {
	type TreeHoleMessageListReq struct {
		PageNum  int `json:"pageNum"`
		PageSize int `json:"pageSize"`
	}
	var req TreeHoleMessageListReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		return
	}
	mess, err := t.svc.GetTreeHoleMessageList(ctx, req.PageNum, req.PageSize)
	if err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	ctx.JSON(http.StatusOK, mess)
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
