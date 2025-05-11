/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-09 20:37:28
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-11 11:29:18
 * @FilePath: \negaihoshi\server\src\web\status.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package web

// 导入 gin 包以解决 undefined: gin 问题
import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/request"
	"negaihoshi/server/src/service"
	"net/http"

	// "strconv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type StatusAndPostsHandler struct {
	svc *service.StatusAndPostsService
}

func NewStatusAndPostsHandler(svc *service.StatusAndPostsService) *StatusAndPostsHandler {
	return &StatusAndPostsHandler{
		svc: svc,
	}
}

func (t *StatusAndPostsHandler) RegisterStatusAndPostsRoutes(server *gin.Engine) {
	tg := server.Group("/api/posts")
	tg.POST("/create", t.CreateStatusAndPostsMessage)
	// tg.GET("/list", t.GetTreeHoleMessageList)
	// tg.GET("/list/:uid", t.GetUserTreeHoleMessageList)
	// tg.GET("/:id", t.GetTreeHoleMessage)
	// tg.DELETE("/:id", t.DeleteTreeHoleMessage)
}

func (t *StatusAndPostsHandler) CreateStatusAndPostsMessage(ctx *gin.Context) {
	type StatusMessageReq struct {
		Title                 string `json:"title"`
		Content               string `json:"content"`
		IsTransferToWordPress bool   `json:"isTransferToWordPress"`
		IsPost                bool   `json:"isPost"`
		SiteUrl               string `json:"siteurl"`
		WPApiKey              string `json:"wpapikey"`
		WPuname               string `json:"wpuname"`
	}
	var req StatusMessageReq
	var err error
	if err = ctx.Bind(&req); err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	sess := sessions.Default(ctx)
	userId := sess.Get("userId").(int64)

	if req.IsPost {
		if req.IsTransferToWordPress {
			// 调用 WordPress API 发布文章
			_, err = request.NewWpRequest().TransferPosts(req.SiteUrl, userId, req.Content, req.WPuname, req.WPApiKey, req.Title)
			if err != nil {
				ctx.String(http.StatusOK, "转发至 WordPress 失败")
			}
		}
		err = t.svc.CreatePostsMessage(ctx, domain.Posts{
			Title:   req.Title,
			Content: req.Content,
			UserId:  userId,
		})
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
			return
		}
		ctx.String(http.StatusOK, "添加成功")
	} else {
		if req.IsTransferToWordPress {
			// 调用 WordPress API 发布文章
			_, err = request.NewWpRequest().TransferStatus(req.SiteUrl, userId, req.Content, req.WPuname, req.WPApiKey)
			if err != nil {
				ctx.String(http.StatusOK, "转发至 WordPress 失败")
			}
		}
		err = t.svc.CreateStatusMessage(ctx, domain.Status{
			Content: req.Content,
			UserId:  userId,
		})
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
			return
		}
		ctx.String(http.StatusOK, "添加成功")
	}
}
