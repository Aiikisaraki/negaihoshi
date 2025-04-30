/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 16:51:21
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-04-30 11:28:52
 * @FilePath: \nekaihoshi\server\src\service\user.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package service

import (
	"context"
	"errors"
	"nekaihoshi/server/src/domain"
	"nekaihoshi/server/src/repository"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserDuplicateEmail    = repository.ErrUserDuplicateEmail
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

	return svc.repo.Create(ctx, u)
}

func (svc *UserService) Login(ctx context.Context, email, password string) (domain.User, error) {
	//先找用户
	u, err := svc.repo.FindByEmail(ctx, email)
	if errors.Is(err, repository.ErrUserNotFound) {
		return domain.User{}, ErrInvaildUserOrPassword
	}
	if err != nil {
		return domain.User{}, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	if err != nil {
		// DEBUG
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
