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

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserDuplicateEmail    = repository.ErrUserDuplicateEmail
	ErrUserDuplicateUsername = errors.New("用户名已被使用")
	ErrInvaildUserOrPassword = errors.New("账号/邮箱或密码不对")
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{
		repo: repo,
	}
}

func (svc *UserService) SignUp(ctx context.Context, u domain.User) error {
	//加密放在哪里
	hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hash)
	//存起来

	err = svc.repo.Create(ctx, u)
	if err != nil {
		if err.Error() == "用户名已被使用" {
			return ErrUserDuplicateUsername
		}
		return err
	}
	return nil
}

func (svc *UserService) Login(ctx context.Context, username, password string) (domain.User, error) {
	var u domain.User
	var err error

	// 先尝试通过邮箱查找用户
	u, err = svc.repo.FindByEmail(ctx, username)
	if err != nil {
		// 如果邮箱查找失败，尝试通过用户名查找
		u, err = svc.repo.FindByUsername(ctx, username)
		if err != nil {
			return domain.User{}, ErrInvaildUserOrPassword
		}
	}

	err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	if err != nil {
		return domain.User{}, ErrInvaildUserOrPassword
	}
	return u, nil
}

func (svc *UserService) BindWordPressInfo(ctx context.Context, wpInfo domain.UserWordpressInfo) error {
	err := svc.repo.CreateWordpressInfo(ctx, domain.UserWordpressInfo{
		Uid:      wpInfo.Uid,
		WPuname:  wpInfo.WPuname,
		WPApiKey: wpInfo.WPApiKey,
	})
	return err
}

func (svc *UserService) GetWordPressInfo(ctx context.Context, uid int64) (domain.UserWordpressInfo, error) {
	uwpinfo, err := svc.repo.FindWordpressInfoByUid(ctx, uid)
	if err != nil {
		return domain.UserWordpressInfo{}, err
	}
	return uwpinfo, nil
}

func (svc *UserService) DeleteWordPressInfo(ctx context.Context, uid int64) error {
	err := svc.repo.DeleteWordpressInfoByUid(ctx, uid)
	return err
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
