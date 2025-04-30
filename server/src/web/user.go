package web

import (
	"errors"
	"fmt"
	"nekaihoshi/server/src/domain"
	"nekaihoshi/server/src/service"
	"net/http"
	"strconv"

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
	ug.GET("/wordpress/bingdings", u.GetWordPressInfo)
	ug.DELETE("/wordpress/bindings/:uid", u.DeleteWordPressInfo)
}

func (u *UserHandler) Signup(c *gin.Context) {
	type SignupReq struct {
		Email           string `json:"email"`
		ConfirmPassword string `json:"confirmPassword"`
		Password        string `json:"password"`
	}

	var req SignupReq
	// Bind方法会根据Content-Type来解析你的数据到req里面
	// 解析错了，就会直接写回一个400错误
	if err := c.Bind(&req); err != nil {
		return
	}

	ok, err := u.emailExp.MatchString(req.Email)
	if err != nil {
		c.String(http.StatusOK, "系统错误")
		return
	}
	if !ok {
		c.String(http.StatusOK, "你的邮箱格式不对")
		return
	}
	if req.ConfirmPassword != req.Password {
		c.String(http.StatusOK, "两次输入的密码不一致")
		return
	}

	ok, err = u.passwordExp.MatchString(req.Password)
	if err != nil {
		c.String(http.StatusOK, "系统错误")
		return
	}
	if !ok {
		c.String(http.StatusOK, "密码必须大于8位，包含数字、特殊字符")
		return
	}

	//调用一下svc的方法
	err = u.svc.SignUp(c, domain.User{
		Email:    req.Email,
		Password: req.Password,
	})
	if errors.Is(err, service.ErrUserDuplicateEmail) {
		c.String(http.StatusOK, "邮箱冲突")
		return
	}
	if err != nil {
		c.String(http.StatusOK, "系统异常")
		return
	}

	c.String(http.StatusOK, "注册成功")
	fmt.Printf("%+v\n", req)
	// 以下是数据库操作
}

func (u *UserHandler) Login(c *gin.Context) {
	type LoginReq struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var req LoginReq
	if err := c.Bind(&req); err != nil {
		return
	}
	user, err := u.svc.Login(c, req.Email, req.Password)
	if errors.Is(err, service.ErrInvaildUserOrPassword) {
		c.String(http.StatusOK, "用户名或密码不对")
		return
	}
	if err != nil {
		c.String(http.StatusOK, "系统错误")
		return
	}
	// 步骤 2
	// 在这里登录成功了
	sess := sessions.Default(c)
	// 我可以随便设置值了
	sess.Set("userId", user.Id)
	sess.Save()
	c.String(http.StatusOK, "登录成功")
	return
}

func (u *UserHandler) BindWordPressInfo(c *gin.Context) {
	type BindWordPressInfoReq struct {
		WPuname  string `json:"wpuid"`
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
	}
}

func (u *UserHandler) GetWordPressInfo(c *gin.Context) {
	sess := sessions.Default(c)
	uid := sess.Get("userId")
	if uid == nil {
		c.String(http.StatusOK, "未登录")
		return
	}
	uwpinfo, err := u.svc.GetWordPressInfo(c, uid.(int64))
	if err != nil {
		c.String(http.StatusOK, "系统错误")
	}
	c.JSON(http.StatusOK, uwpinfo)
}

func (u *UserHandler) DeleteWordPressInfo(c *gin.Context) {
	uid := c.Param("uid") // 获取URL中的uid参数
	if uid == "" {
		c.String(http.StatusBadRequest, "uid 参数不能为空")
		return
	}
	uidint, err := strconv.ParseInt(uid, 10, 64)
	if err != nil {
		c.String(http.StatusBadRequest, "uid 参数格式不正确")
		return
	}
	err = u.svc.DeleteWordPressInfo(c, uidint)
	if err != nil {
		c.String(http.StatusOK, "删除失败")
	}
}
