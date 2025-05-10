/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-09 20:37:28
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-09 22:32:31
 * @FilePath: \negaihoshi\server\src\web\status.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-09 20:37:28
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-09 22:30:00
 * @FilePath: \negaihoshi\server\src\web\status.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package web

// 导入 gin 包以解决 undefined: gin 问题
import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/service"
	"net/http"

	// "strconv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type StatusHandler struct {
	svc *service.StatusService
}

func NewStatusHandler(svc *service.StatusService) *StatusHandler {
	return &StatusHandler{
		svc: svc,
	}
}

func (t *StatusHandler) RegisterStatusRoutes(server *gin.Engine) {
	tg := server.Group("/api/status")
	tg.POST("/create", t.CreateStatusMessage)
	// tg.GET("/list", t.GetTreeHoleMessageList)
	// tg.GET("/list/:uid", t.GetUserTreeHoleMessageList)
	// tg.GET("/:id", t.GetTreeHoleMessage)
	// tg.DELETE("/:id", t.DeleteTreeHoleMessage)
}

func (t *StatusHandler) CreateStatusMessage(ctx *gin.Context) {
	type StatusMessageReq struct {
		Content               string `json:"content"`
		IsTransferToWordPress bool   `json:"isTransferToWordPress"`
	}
	var req StatusMessageReq
	if err := ctx.Bind(&req); err != nil {
		ctx.String(http.StatusOK, "系统错误")
		return
	}
	sess := sessions.Default(ctx)
	userId := sess.Get("userId").(int64)
	err := t.svc.CreateStatusMessage(ctx, domain.Status{
		Content: req.Content,
		UserId:  userId,
	})
	if err != nil {
		ctx.String(http.StatusOK, "系统错误")
	}
	ctx.String(http.StatusOK, "添加成功")
}
