package web

import (
	"net/http"
	"strconv"

	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/service"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
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

func (h *UserHandler) RegisterUserRoutes(server *gin.Engine) {
	ug := server.Group("/api/users")
	ug.POST("/signup", h.Signup)
	ug.POST("/login", h.Login)
	ug.POST("/logout", h.Logout)
	ug.GET("/profile", h.GetProfile)
	ug.PUT("/profile", h.UpdateProfile)

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
	c.Set("user_id", nil)
	c.Set("username", nil)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "登出成功",
	})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	// 从session获取用户ID
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "请先登录",
		})
		return
	}

	userID, ok := userIDInterface.(int64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "用户ID类型错误",
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

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	// 从session获取用户ID
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "请先登录",
		})
		return
	}

	userID, ok := userIDInterface.(int64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "用户ID类型错误",
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

	err := h.userService.UpdateProfile(c.Request.Context(), userID, profile)
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

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
	})
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
