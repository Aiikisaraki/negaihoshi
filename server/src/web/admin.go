/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-20 20:30:00
 * @Description: 后台管理系统API
 */
package web

import (
	"negaihoshi/server/src/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	userService     *service.UserService
	treeholeService *service.TreeHoleService
	statusService   *service.StatusAndPostsService
}

func NewAdminHandler(userService *service.UserService, treeholeService *service.TreeHoleService, statusService *service.StatusAndPostsService) *AdminHandler {
	return &AdminHandler{
		userService:     userService,
		treeholeService: treeholeService,
		statusService:   statusService,
	}
}

// 注册管理后台路由
func (a *AdminHandler) RegisterAdminRoutes(server *gin.Engine) {
	admin := server.Group("/api/admin")
	{
		// 仪表板统计
		admin.GET("/dashboard", a.GetDashboardStats)

		// 用户管理
		admin.GET("/users", a.GetUserList)
		admin.GET("/users/:id", a.GetUserDetail)
		admin.PUT("/users/:id", a.UpdateUser)
		admin.DELETE("/users/:id", a.DeleteUser)
		admin.POST("/users/:id/ban", a.BanUser)
		admin.POST("/users/:id/unban", a.UnbanUser)

		// 内容管理
		admin.GET("/content/treehole", a.GetTreeholeList)
		admin.DELETE("/content/treehole/:id", a.DeleteTreehole)
		admin.POST("/content/treehole/:id/approve", a.ApproveTreehole)
		admin.POST("/content/treehole/:id/reject", a.RejectTreehole)

		admin.GET("/content/status", a.GetStatusList)
		admin.DELETE("/content/status/:id", a.DeleteStatus)
		admin.POST("/content/status/:id/approve", a.ApproveStatus)
		admin.POST("/content/status/:id/reject", a.RejectStatus)

		// 系统设置
		admin.GET("/settings", a.GetSystemSettings)
		admin.PUT("/settings", a.UpdateSystemSettings)

		// 日志查看
		admin.GET("/logs", a.GetSystemLogs)
		admin.GET("/logs/error", a.GetErrorLogs)
	}
}

// 获取仪表板统计数据
func (a *AdminHandler) GetDashboardStats(ctx *gin.Context) {
	// 获取用户统计
	userStats, err := a.userService.GetUserStats()
	if err != nil {
		ErrorResponse(ctx, 500, "获取用户统计失败")
		return
	}

	// 获取内容统计
	contentStats, err := a.treeholeService.GetContentStats()
	if err != nil {
		ErrorResponse(ctx, 500, "获取内容统计失败")
		return
	}

	// 获取系统统计
	systemStats, err := a.statusService.GetSystemStats()
	if err != nil {
		ErrorResponse(ctx, 500, "获取系统统计失败")
		return
	}

	SuccessResponse(ctx, gin.H{
		"user_stats":    userStats,
		"content_stats": contentStats,
		"system_stats":  systemStats,
	})
}

// 获取用户列表
func (a *AdminHandler) GetUserList(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(ctx.DefaultQuery("size", "10"))
	keyword := ctx.Query("keyword")
	status := ctx.Query("status")

	users, total, err := a.userService.GetUserListForAdmin(page, size, keyword, status)
	if err != nil {
		ErrorResponse(ctx, 500, "获取用户列表失败")
		return
	}

	SuccessResponse(ctx, gin.H{
		"users": users,
		"total": total,
		"page":  page,
		"size":  size,
	})
}

// 获取用户详情
func (a *AdminHandler) GetUserDetail(ctx *gin.Context) {
	userID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "用户ID格式错误")
		return
	}

	user, err := a.userService.GetUserDetailForAdmin(userID)
	if err != nil {
		ErrorResponse(ctx, 500, "获取用户详情失败")
		return
	}

	SuccessResponse(ctx, gin.H{"user": user})
}

// 更新用户信息
func (a *AdminHandler) UpdateUser(ctx *gin.Context) {
	userID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "用户ID格式错误")
		return
	}

	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Status   string `json:"status"`
		Role     string `json:"role"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "请求参数错误")
		return
	}

	err = a.userService.UpdateUserForAdmin(userID, req.Username, req.Email, req.Status, req.Role)
	if err != nil {
		ErrorResponse(ctx, 500, "更新用户信息失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "用户信息更新成功"})
}

// 删除用户
func (a *AdminHandler) DeleteUser(ctx *gin.Context) {
	userID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "用户ID格式错误")
		return
	}

	err = a.userService.DeleteUserForAdmin(userID)
	if err != nil {
		ErrorResponse(ctx, 500, "删除用户失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "用户删除成功"})
}

// 封禁用户
func (a *AdminHandler) BanUser(ctx *gin.Context) {
	userID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "用户ID格式错误")
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "请求参数错误")
		return
	}

	err = a.userService.BanUser(userID, req.Reason)
	if err != nil {
		ErrorResponse(ctx, 500, "封禁用户失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "用户封禁成功"})
}

// 解封用户
func (a *AdminHandler) UnbanUser(ctx *gin.Context) {
	userID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "用户ID格式错误")
		return
	}

	err = a.userService.UnbanUser(userID)
	if err != nil {
		ErrorResponse(ctx, 500, "解封用户失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "用户解封成功"})
}

// 获取树洞列表
func (a *AdminHandler) GetTreeholeList(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(ctx.DefaultQuery("size", "10"))
	status := ctx.Query("status")

	treeholes, total, err := a.treeholeService.GetTreeholeListForAdmin(page, size, status)
	if err != nil {
		ErrorResponse(ctx, 500, "获取树洞列表失败")
		return
	}

	SuccessResponse(ctx, gin.H{
		"treeholes": treeholes,
		"total":     total,
		"page":      page,
		"size":      size,
	})
}

// 删除树洞
func (a *AdminHandler) DeleteTreehole(ctx *gin.Context) {
	treeholeID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "树洞ID格式错误")
		return
	}

	err = a.treeholeService.DeleteTreeholeForAdmin(treeholeID)
	if err != nil {
		ErrorResponse(ctx, 500, "删除树洞失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "树洞删除成功"})
}

// 审核通过树洞
func (a *AdminHandler) ApproveTreehole(ctx *gin.Context) {
	treeholeID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "树洞ID格式错误")
		return
	}

	err = a.treeholeService.ApproveTreehole(treeholeID)
	if err != nil {
		ErrorResponse(ctx, 500, "审核通过失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "审核通过成功"})
}

// 审核拒绝树洞
func (a *AdminHandler) RejectTreehole(ctx *gin.Context) {
	treeholeID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "树洞ID格式错误")
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "请求参数错误")
		return
	}

	err = a.treeholeService.RejectTreehole(treeholeID, req.Reason)
	if err != nil {
		ErrorResponse(ctx, 500, "审核拒绝失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "审核拒绝成功"})
}

// 获取动态列表
func (a *AdminHandler) GetStatusList(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(ctx.DefaultQuery("size", "10"))
	status := ctx.Query("status")

	statuses, total, err := a.statusService.GetStatusListForAdmin(page, size, status)
	if err != nil {
		ErrorResponse(ctx, 500, "获取动态列表失败")
		return
	}

	SuccessResponse(ctx, gin.H{
		"statuses": statuses,
		"total":    total,
		"page":     page,
		"size":     size,
	})
}

// 删除动态
func (a *AdminHandler) DeleteStatus(ctx *gin.Context) {
	statusID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "动态ID格式错误")
		return
	}

	err = a.statusService.DeleteStatusForAdmin(statusID)
	if err != nil {
		ErrorResponse(ctx, 500, "删除动态失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "动态删除成功"})
}

// 审核通过动态
func (a *AdminHandler) ApproveStatus(ctx *gin.Context) {
	statusID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "动态ID格式错误")
		return
	}

	err = a.statusService.ApproveStatus(statusID)
	if err != nil {
		ErrorResponse(ctx, 500, "审核通过失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "审核通过成功"})
}

// 审核拒绝动态
func (a *AdminHandler) RejectStatus(ctx *gin.Context) {
	statusID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ValidationError(ctx, "动态ID格式错误")
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "请求参数错误")
		return
	}

	err = a.statusService.RejectStatus(statusID, req.Reason)
	if err != nil {
		ErrorResponse(ctx, 500, "审核拒绝失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "审核拒绝成功"})
}

// 获取系统设置
func (a *AdminHandler) GetSystemSettings(ctx *gin.Context) {
	settings, err := a.userService.GetSystemSettings()
	if err != nil {
		ErrorResponse(ctx, 500, "获取系统设置失败")
		return
	}

	SuccessResponse(ctx, gin.H{"settings": settings})
}

// 更新系统设置
func (a *AdminHandler) UpdateSystemSettings(ctx *gin.Context) {
	var req struct {
		SiteName        string `json:"site_name"`
		SiteDescription string `json:"site_description"`
		AllowRegister   bool   `json:"allow_register"`
		ContentReview   bool   `json:"content_review"`
		MaxPostLength   int    `json:"max_post_length"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "请求参数错误")
		return
	}

	err := a.userService.UpdateSystemSettings(req.SiteName, req.SiteDescription, req.AllowRegister, req.ContentReview, req.MaxPostLength)
	if err != nil {
		ErrorResponse(ctx, 500, "更新系统设置失败")
		return
	}

	SuccessResponse(ctx, gin.H{"message": "系统设置更新成功"})
}

// 获取系统日志
func (a *AdminHandler) GetSystemLogs(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(ctx.DefaultQuery("size", "10"))
	level := ctx.Query("level")

	logs, total, err := a.userService.GetSystemLogs(page, size, level)
	if err != nil {
		ErrorResponse(ctx, 500, "获取系统日志失败")
		return
	}

	SuccessResponse(ctx, gin.H{
		"logs":  logs,
		"total": total,
		"page":  page,
		"size":  size,
	})
}

// 获取错误日志
func (a *AdminHandler) GetErrorLogs(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(ctx.DefaultQuery("size", "10"))

	logs, total, err := a.userService.GetErrorLogs(page, size)
	if err != nil {
		ErrorResponse(ctx, 500, "获取错误日志失败")
		return
	}

	SuccessResponse(ctx, gin.H{
		"logs":  logs,
		"total": total,
		"page":  page,
		"size":  size,
	})
}

