package web

import (
	"fmt"
	"net/http"
	"strconv"

	"mime/multipart"

	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/service"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService   *service.UserService
	avatarStorage service.AvatarStorage
}

func NewUserHandler(userService *service.UserService, avatarStorage service.AvatarStorage) *UserHandler {
	return &UserHandler{
		userService:   userService,
		avatarStorage: avatarStorage,
	}
}

type SignupReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ProfileUpdateReq struct {
	Nickname string `json:"nickname"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
	Phone    string `json:"phone"`
	Location string `json:"location"`
	Website  string `json:"website"`
}

// getUserIDFromContext 安全获取登录用户ID，兼容多种类型
func getUserIDFromContext(c *gin.Context) (int64, error) {
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		return 0, fmt.Errorf("unauthorized")
	}

	switch v := userIDInterface.(type) {
	case int64:
		return v, nil
	case int:
		return int64(v), nil
	case int32:
		return int64(v), nil
	case float64:
		return int64(v), nil
	case float32:
		return int64(v), nil
	case string:
		uid, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			return 0, fmt.Errorf("invalid user id")
		}
		return uid, nil
	default:
		return 0, fmt.Errorf("invalid user id type")
	}
}

func (h *UserHandler) RegisterUserRoutes(server *gin.Engine) {
	ug := server.Group("/api/users")
	ug.POST("/signup", h.Signup)
	ug.POST("/login", h.Login)
	ug.POST("/logout", h.Logout)
	ug.GET("/profile", h.GetProfile)
	ug.GET("/profile/:id", h.GetProfileById)
	ug.PUT("/profile", h.UpdateProfile)
	ug.POST("/avatar", h.UploadAvatar) // 添加头像上传接口
	ug.GET("/avatar", h.GetAvatar)     // 获取头像地址接口

	// 管理后台相关路由
	adminGroup := server.Group("/api/admin")
	adminGroup.GET("/stats", h.GetUserStats)
	adminGroup.GET("/list", h.GetUserList)
}

func (h *UserHandler) Signup(c *gin.Context) {
	var req SignupReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误: " + err.Error(),
		})
		return
	}

	err := h.userService.SignUp(c.Request.Context(), req.Username, req.Password, req.Email)
	if err != nil {
		var message string
		switch err {
		case service.ErrUserDuplicateUsername:
			message = "用户名已被使用"
		case service.ErrUserDuplicateEmail:
			message = "邮箱已被使用"
		default:
			message = "注册失败: " + err.Error()
		}
		c.JSON(http.StatusConflict, gin.H{
			"code":    409,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "注册成功",
	})
}

func (h *UserHandler) Login(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误: " + err.Error(),
		})
		return
	}

	user, err := h.userService.Login(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		var message string
		switch err {
		case service.ErrInvalidCredentials:
			message = "用户名或密码错误"
		case service.ErrUserNotFound:
			message = "用户不存在"
		default:
			message = "登录失败: " + err.Error()
		}
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": message,
		})
		return
	}

	// 设置session
	sess := sessions.Default(c)
	sess.Set("userId", user.Id)
	sess.Set("username", user.Username)
	err = sess.Save()
	if err != nil {
		fmt.Printf("保存session失败: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "session保存失败",
		})
		return
	}
	fmt.Printf("Session保存成功，userId: %v, username: %v\n", user.Id, user.Username)

	// 同时设置到上下文中，供后续处理器使用
	c.Set("user_id", user.Id)
	c.Set("username", user.Username)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "登录成功",
		"data": gin.H{
			"user_id":  user.Id,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func (h *UserHandler) Logout(c *gin.Context) {
	// 清除session
	sess := sessions.Default(c)
	sess.Clear()
	sess.Save()

	// 同时清除上下文中的值
	c.Set("user_id", nil)
	c.Set("username", nil)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "登出成功",
	})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	// 获取用户ID
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "请先登录",
		})
		return
	}

	profile, err := h.userService.GetProfile(c.Request.Context(), userID)
	if err != nil {
		var message string
		switch err {
		case service.ErrUserNotFound:
			message = "用户不存在"
		default:
			message = "获取个人资料失败: " + err.Error()
		}
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "获取成功",
		"data":    profile,
	})
}

// GetProfileById 获取指定用户的资料（公开信息）
func (h *UserHandler) GetProfileById(c *gin.Context) {
	idStr := c.Param("id")
	uid, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || uid <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户ID格式错误"})
		return
	}

	profile, err := h.userService.GetProfile(c.Request.Context(), uid)
	if err != nil {
		var message string
		switch err {
		case service.ErrUserNotFound:
			message = "用户不存在"
		default:
			message = "获取个人资料失败: " + err.Error()
		}
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "获取成功",
		"data":    profile,
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	// 获取用户ID
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "请先登录",
		})
		return
	}

	var req ProfileUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误: " + err.Error(),
		})
		return
	}

	profile := &domain.ProfileUpdateRequest{
		Nickname: req.Nickname,
		Bio:      req.Bio,
		Avatar:   req.Avatar,
		Phone:    req.Phone,
		Location: req.Location,
		Website:  req.Website,
	}

	err = h.userService.UpdateProfile(c.Request.Context(), userID, profile)
	if err != nil {
		var message string
		switch err {
		case service.ErrUserNotFound:
			message = "用户不存在"
		default:
			message = "更新个人资料失败: " + err.Error()
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": message,
		})
		return
	}

	// 更新成功后，返回最新的资料
	updated, fetchErr := h.userService.GetProfile(c.Request.Context(), userID)
	if fetchErr != nil {
		// 如果获取失败，仍返回成功但无 data，便于前端再发起一次 GET
		c.JSON(http.StatusOK, gin.H{
			"code":    200,
			"message": "更新成功",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
		"data":    updated,
	})
}

// UploadAvatar handles avatar upload
func (h *UserHandler) UploadAvatar(c *gin.Context) {
	// 获取用户ID
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "请先登录",
		})
		return
	}

	// 获取上传的文件
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "未找到上传的文件: " + err.Error(),
		})
		return
	}

	// 检查文件大小 (限制为5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "文件大小不能超过5MB",
		})
		return
	}

	// 检查文件类型
	if !isImageFile(file) {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "只支持图片文件上传",
		})
		return
	}

	// 打开文件
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "无法打开上传的文件: " + err.Error(),
		})
		return
	}
	defer src.Close()

	// 保存头像
	avatarURL, err := h.avatarStorage.SaveAvatar(src, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "保存头像失败: " + err.Error(),
		})
		return
	}

	// 将头像地址保存到数据库
	if err := h.userService.UpdateAvatar(c.Request.Context(), userID, avatarURL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新头像地址失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "头像上传成功",
		"data": gin.H{
			"avatar_url": avatarURL,
		},
	})
}

// isImageFile checks if the uploaded file is an image
func isImageFile(file *multipart.FileHeader) bool {
	contentType := file.Header.Get("Content-Type")
	return contentType == "image/jpeg" ||
		contentType == "image/jpg" ||
		contentType == "image/png" ||
		contentType == "image/gif"
}

// 管理后台相关方法
func (h *UserHandler) GetUserStats(c *gin.Context) {
	// 获取用户统计信息
	totalUsers, err := h.userService.GetTotalUserCount(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取用户统计失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"total_users": totalUsers,
		},
	})
}

func (h *UserHandler) GetUserList(c *gin.Context) {
	// 获取用户列表（分页）
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	// 这里应该实现分页逻辑
	users := []gin.H{
		{
			"id":       1,
			"username": "admin",
			"email":    "admin@example.com",
			"nickname": "管理员",
			"ctime":    "2025-01-01 00:00:00",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"users":     users,
			"page":      page,
			"page_size": pageSize,
			"total":     len(users),
		},
	})
}

// GetAvatar 返回当前登录用户的头像地址
func (h *UserHandler) GetAvatar(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "请先登录",
		})
		return
	}

	avatar, err := h.userService.GetAvatarURL(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取头像失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "获取成功",
		"data": gin.H{
			"avatar_url": avatar,
		},
	})
}
