/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 16:51:21
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-01 19:41:19
 * @FilePath: \nekaihoshi\server\src\service\user.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package service

import (
	"context"
	"errors"

	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository"
	"negaihoshi/server/src/util"
)

var (
	ErrUserDuplicateUsername = errors.New("用户名已被使用")
	ErrUserDuplicateEmail    = errors.New("邮箱已被使用")
	ErrUserNotFound          = errors.New("用户不存在")
	ErrInvalidCredentials    = errors.New("用户名或密码错误")
	ErrPasswordEncryption    = errors.New("密码加密失败")
)

type UserService struct {
	userRepo *repository.UserRepository
	crypto   *util.PasswordCrypto
}

func NewUserService(userRepo *repository.UserRepository, crypto *util.PasswordCrypto) *UserService {
	return &UserService{
		userRepo: userRepo,
		crypto:   crypto,
	}
}

func (svc *UserService) SignUp(ctx context.Context, username, password, email string) error {
	// 检查用户名是否已存在
	_, err := svc.userRepo.FindByUsername(ctx, username)
	if err == nil {
		return ErrUserDuplicateUsername
	}

	// 检查邮箱是否已存在
	_, err = svc.userRepo.FindByEmail(ctx, email)
	if err == nil {
		return ErrUserDuplicateEmail
	}

	// 加密密码
	encryptedPassword, err := svc.crypto.EncryptPassword(password)
	if err != nil {
		return ErrPasswordEncryption
	}

	// 创建新用户
	user := &domain.User{
		Username: username,
		Password: encryptedPassword, // 存储加密后的密码
		Email:    email,
		Nickname: username, // 默认昵称为用户名
		Bio:      "欢迎来到星の海の物語！",
	}

	return svc.userRepo.Create(ctx, user)
}

func (svc *UserService) Login(ctx context.Context, usernameOrEmail, password string) (*domain.User, error) {
	var user *domain.User
	var err error

	// 尝试通过用户名登录
	user, err = svc.userRepo.FindByUsername(ctx, usernameOrEmail)
	if err != nil {
		// 尝试通过邮箱登录
		user, err = svc.userRepo.FindByEmail(ctx, usernameOrEmail)
		if err != nil {
			return nil, ErrInvalidCredentials
		}
	}

	// 验证密码（使用加密验证）
	if !svc.crypto.VerifyPassword(password, user.Password) {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}

func (svc *UserService) GetProfile(ctx context.Context, userID int64) (*domain.ProfileResponse, error) {
	user, err := svc.userRepo.FindById(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return &domain.ProfileResponse{
		Id:       user.Id,
		Username: user.Username,
		Email:    user.Email,
		Nickname: user.Nickname,
		Bio:      user.Bio,
		Avatar:   user.Avatar,
		Phone:    user.Phone,
		Location: user.Location,
		Website:  user.Website,
		Ctime:    user.Ctime.Format("2006-01-02 15:04:05"),
		Utime:    user.Utime.Format("2006-01-02 15:04:05"),
	}, nil
}

func (svc *UserService) UpdateProfile(ctx context.Context, userID int64, profile *domain.ProfileUpdateRequest) error {
	// 验证用户是否存在
	_, err := svc.userRepo.FindById(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}

	return svc.userRepo.UpdateProfile(ctx, userID, profile)
}

func (svc *UserService) GetTotalUserCount(ctx context.Context) (int64, error) {
	return svc.userRepo.GetTotalUserCount(ctx)
}

// 管理后台相关方法

// 获取用户统计信息
func (svc *UserService) GetUserStats() (map[string]interface{}, error) {
	// 暂时返回示例数据，后续可以连接数据库获取真实数据
	return map[string]interface{}{
		"total_users":     1250,
		"active_users":    1180,
		"banned_users":    15,
		"growth_rate":     "12.5%",
		"new_users_today": 8,
		"new_users_week":  45,
	}, nil
}

// 获取用户列表（管理后台）
func (svc *UserService) GetUserListForAdmin(page, size int, keyword, status string) ([]domain.User, int64, error) {
	// 暂时返回示例数据
	users := []domain.User{
		{
			Id:       1,
			Email:    "admin@example.com",
			Password: "",
		},
		{
			Id:       2,
			Email:    "user1@example.com",
			Password: "",
		},
	}

	return users, int64(len(users)), nil
}

// 获取用户详情（管理后台）
func (svc *UserService) GetUserDetailForAdmin(userID int64) (map[string]interface{}, error) {
	// 暂时返回示例数据
	return map[string]interface{}{
		"user": domain.User{
			Id:       userID,
			Email:    "user@example.com",
			Password: "",
		},
		"wordpress_info": domain.UserWordpressInfo{
			Uid:      userID,
			WPuname:  "wpuser",
			WPApiKey: "api_key_123",
		},
		"content_stats": map[string]interface{}{
			"treehole_count": 15,
			"status_count":   8,
			"post_count":     3,
		},
	}, nil
}

// 更新用户信息（管理后台）
func (svc *UserService) UpdateUserForAdmin(userID int64, username, email, status, role string) error {
	// 暂时返回nil，实际实现时需要更新数据库
	return nil
}

// 删除用户（管理后台）
func (svc *UserService) DeleteUserForAdmin(userID int64) error {
	// 暂时返回nil，实际实现时需要删除数据库记录
	return nil
}

// 封禁用户
func (svc *UserService) BanUser(userID int64, reason string) error {
	// 暂时返回nil，实际实现时需要更新用户状态
	return nil
}

// 解封用户
func (svc *UserService) UnbanUser(userID int64) error {
	// 暂时返回nil，实际实现时需要更新用户状态
	return nil
}

// 获取系统设置
func (svc *UserService) GetSystemSettings() (map[string]interface{}, error) {
	// 这里可以从配置文件或数据库获取系统设置
	return map[string]interface{}{
		"site_name":        "树洞系统",
		"site_description": "一个匿名分享心情的平台",
		"allow_register":   true,
		"content_review":   false,
		"max_post_length":  1000,
		"api_docs_enabled": true,
	}, nil
}

// 更新系统设置
func (svc *UserService) UpdateSystemSettings(siteName, siteDescription string, allowRegister, contentReview bool, maxPostLength int) error {
	// 这里可以更新配置文件或数据库中的系统设置
	// 暂时返回nil，实际实现时需要持久化存储
	return nil
}

// 获取系统日志
func (svc *UserService) GetSystemLogs(page, size int, level string) ([]map[string]interface{}, int64, error) {
	// 示例日志数据
	logs := []map[string]interface{}{
		{
			"id":        1,
			"level":     "INFO",
			"message":   "用户登录成功",
			"user_id":   123,
			"timestamp": "2025-01-20T10:00:00Z",
		},
		{
			"id":        2,
			"level":     "WARN",
			"message":   "用户尝试访问未授权资源",
			"user_id":   456,
			"timestamp": "2025-01-20T09:30:00Z",
		},
	}

	return logs, int64(len(logs)), nil
}

// 获取错误日志
func (svc *UserService) GetErrorLogs(page, size int) ([]map[string]interface{}, int64, error) {
	// 示例错误日志数据
	logs := []map[string]interface{}{
		{
			"id":        1,
			"level":     "ERROR",
			"message":   "数据库连接失败",
			"stack":     "stack trace...",
			"timestamp": "2025-01-20T08:00:00Z",
		},
	}

	return logs, int64(len(logs)), nil
}
