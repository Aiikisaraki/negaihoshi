package web

import (
	"errors"
	"fmt"
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/service"
	"net/http"

	regexp "github.com/dlclark/regexp2"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	svc         *service.UserService
	emailExp    *regexp.Regexp
	passwordExp *regexp.Regexp
}

func NewUserHandler(svc *service.UserService) *UserHandler {
	const (
		emailRegexPattern = "^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$"
		passwordPattern   = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$"
	)
	emailExp := regexp.MustCompile(emailRegexPattern, regexp.None)
	passwordExp := regexp.MustCompile(passwordPattern, regexp.None)
	return &UserHandler{
		svc:         svc,
		emailExp:    emailExp,
		passwordExp: passwordExp,
	}
}

func (u *UserHandler) RegisterUserRoutes(server *gin.Engine) {
	ug := server.Group("/api/users")
	ug.POST("/signup", u.Signup)
	ug.POST("/login", u.Login)
	ug.POST("/wordpress/bind", u.BindWordPressInfo)
	ug.GET("/wordpress/bindings", u.GetWordPressInfo)
	ug.DELETE("/wordpress/bindings", u.DeleteWordPressInfo)
}

func (u *UserHandler) Signup(c *gin.Context) {
	type SignupReq struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req SignupReq
	// Bind方法会根据Content-Type来解析你的数据到req里面
	// 解析错了，就会直接写回一个400错误
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数格式错误",
			"error":   err.Error(),
		})
		return
	}

	// 验证必填字段
	if req.Username == "" || req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "用户名、邮箱和密码不能为空",
		})
		return
	}

	// 验证邮箱格式
	ok, err := u.emailExp.MatchString(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "系统错误",
		})
		return
	}
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "邮箱格式不正确",
		})
		return
	}

	// 验证密码强度
	ok, err = u.passwordExp.MatchString(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "系统错误",
		})
		return
	}
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "密码必须大于8位，包含数字、特殊字符",
		})
		return
	}

	// 调用service的方法
	err = u.svc.SignUp(c, domain.User{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
	})
	if errors.Is(err, service.ErrUserDuplicateEmail) {
		c.JSON(http.StatusConflict, gin.H{
			"code":    409,
			"message": "邮箱已被注册",
		})
		return
	}
	if errors.Is(err, service.ErrUserDuplicateUsername) {
		c.JSON(http.StatusConflict, gin.H{
			"code":    409,
			"message": "用户名已被使用",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "系统异常，注册失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "注册成功",
		"data": gin.H{
			"username": req.Username,
			"email":    req.Email,
		},
	})
}

func (u *UserHandler) Login(c *gin.Context) {
	type LoginReq struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	var req LoginReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数格式错误",
			"error":   err.Error(),
		})
		return
	}

	// 验证必填字段
	if req.Username == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "用户名和密码不能为空",
		})
		return
	}

	user, err := u.svc.Login(c, req.Username, req.Password)
	if errors.Is(err, service.ErrInvaildUserOrPassword) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "用户名或密码错误",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "系统错误",
			"error":   err.Error(),
		})
		return
	}

	// 在这里登录成功了
	sess := sessions.Default(c)
	// 我可以随便设置值了
	sess.Set("userId", user.Id)
	sess.Set("username", user.Username)
	sess.Set("email", user.Email)
	sess.Save()

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "登录成功",
		"data": gin.H{
			"user_id":  user.Id,
			"username": user.Username,
			"email":    user.Email,
		},
	})
	return
}

func (u *UserHandler) BindWordPressInfo(c *gin.Context) {
	type BindWordPressInfoReq struct {
		WPuname  string `json:"wpuname"`
		WPApiKey string `json:"wpapikey"`
	}
	sess := sessions.Default(c)
	uid := sess.Get("userId")
	if uid == nil {
		c.String(http.StatusOK, "未登录")
		return
	}
	var req BindWordPressInfoReq
	if err := c.Bind(&req); err != nil {
		return
	}
	err := u.svc.BindWordPressInfo(c, domain.UserWordpressInfo{
		// 进行类型断言，将 uid 从 interface{} 类型转换为 int64 类型
		Uid:      uid.(int64),
		WPuname:  req.WPuname,
		WPApiKey: req.WPApiKey,
	})
	if err != nil {
		c.String(http.StatusOK, "绑定失败")
		return
	}
	c.String(http.StatusOK, "绑定成功")
}

func (u *UserHandler) GetWordPressInfo(c *gin.Context) {
	sess := sessions.Default(c)
	uid := sess.Get("userId")
	if uid == nil {
		c.String(http.StatusOK, "未登录")
		return
	}
	uwpinfo, err := u.svc.GetWordPressInfo(c, uid.(int64))
	fmt.Println(err) // 输出 uwpinfo 的值以检查其内容和类型
	if err != nil {
		c.String(http.StatusOK, "系统错误")
		return
	}
	c.JSON(http.StatusOK, uwpinfo)
}

func (u *UserHandler) DeleteWordPressInfo(c *gin.Context) {
	sess := sessions.Default(c)
	uid := sess.Get("userId")
	if uid == nil {
		c.String(http.StatusOK, "未登录")
		return
	}
	err := u.svc.DeleteWordPressInfo(c, uid.(int64))
	if err != nil {
		c.String(http.StatusOK, "删除失败")
		return
	}
	c.String(http.StatusOK, "删除成功")
}
