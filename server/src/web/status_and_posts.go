/*
 * @Author: Aiikisaraki morikawa@kimisui56.work
 * @Date: 2025-05-10 17:32:11
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-24 22:59:49
 * @FilePath: \negaihoshi\server\src\web\status_and_posts.go
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
	tg.PATCH("/edit", t.EditStatusAndPostsMessage)
	tg.GET("/view/:id", t.GetStatusAndPostsMessage)
	tg.GET("/:uid", t.GetUserStatusAndPostsMessageList)
	tg.GET("/listAll", t.GetStatusAndPostsMessageList)
	tg.DELETE("/delete/:id", t.DeleteStatusAndPostsMessage)
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

func (t *StatusAndPostsHandler) EditStatusAndPostsMessage(ctx *gin.Context) {
	type StatusMessageReq struct {
		Id                    int64  `json:"id"`
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
		err = t.svc.EditPostsMessage(ctx, domain.Posts{
			Id:      req.Id,
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
		err = t.svc.EditStatusMessage(ctx, domain.Status{
			Id:      req.Id,
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

func (t *StatusAndPostsHandler) GetStatusAndPostsMessage(ctx *gin.Context) {
	type GetMessageReq struct {
		Id     int64 `json:"id"`
		IsPost bool  `json:"isPost"`
	}
	var req GetMessageReq
	var err error
	if err = ctx.Bind(&req); err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	if req.IsPost {
		post, err := t.svc.GetPostFromThisSite(ctx, req.Id)
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
			return
		}
		ctx.JSON(http.StatusOK, post)
	} else {
		status, err := t.svc.GetStatusFromThisSite(ctx, req.Id)
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
			return
		}
		ctx.JSON(http.StatusOK, status)
	}
}
func (t *StatusAndPostsHandler) GetUserStatusAndPostsMessageList(ctx *gin.Context) {
	type GetMessageListReq struct {
		UserId int64 `json:"userId"`
		IsPost bool  `json:"isPost"`
	}
	var req GetMessageListReq
	var err error
	if err = ctx.Bind(&req); err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	if req.IsPost {
		posts, err := t.svc.GetPostsByUser(ctx, req.UserId)
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
		}
		ctx.JSON(http.StatusOK, posts)
	} else {
		status, err := t.svc.GetStatusByUser(ctx, req.UserId)
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
		}
		ctx.JSON(http.StatusOK, status)
	}
	return
}
func (t *StatusAndPostsHandler) GetStatusAndPostsMessageList(ctx *gin.Context) {
	type GetMessageListReq struct {
		IsPost bool `json:"isPost"`
	}
	var req GetMessageListReq
	var err error
	if err = ctx.Bind(&req); err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	if req.IsPost {
		posts, err := t.svc.GetPostsMessageList(ctx)
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
			return
		}
		ctx.JSON(http.StatusOK, posts)
	} else {
		status, err := t.svc.GetStatusMessageList(ctx)
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
			return
		}
		ctx.JSON(http.StatusOK, status)
	}
	return
}
func (t *StatusAndPostsHandler) DeleteStatusAndPostsMessage(ctx *gin.Context) {
	type DeleteMessageReq struct {
		Id     int64 `json:"id"`
		IsPost bool  `json:"isPost"`
	}
	var req DeleteMessageReq
	var err error
	if err = ctx.Bind(&req); err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	if req.IsPost {
		err = t.svc.DeletePosts(ctx, req.Id)
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
			return
		}
	} else {
		err = t.svc.DeleteStatus(ctx, req.Id)
		if err != nil {
			ctx.String(http.StatusOK, "系统错误")
			return
		}
	}
	ctx.String(http.StatusOK, "删除成功")
	return
}
