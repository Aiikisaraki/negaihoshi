/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 15:07:13
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-04-23 11:35:34
 * @FilePath: \nekaihoshi\server\src\repository\user.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package repository

import (
	"context"
	"nekaihoshi/server/src/domain"
	"nekaihoshi/server/src/repository/dao"

	"github.com/redis/go-redis/v9"
)

var (
	ErrUserDuplicateEmail  = dao.ErrUserDuplicateEmail
	ErrUserNotFound        = dao.ErrUserNotFound
	ErrUserProfileNotFound = dao.ErrUserProfileNotFound
)

type UserRepository struct {
	udao        *dao.UserDAO
	wpudao      *dao.UserWordpressInfoDAO
	redisClient *redis.Client
}

func NewUserRepository(udao *dao.UserDAO, wpudao *dao.UserWordpressInfoDAO, rc *redis.Client) *UserRepository {
	return &UserRepository{
		udao:        udao,
		wpudao:      wpudao,
		redisClient: rc,
	}
}

func (r *UserRepository) FindById(ctx context.Context, id int64) (domain.User, error) {
	// 先从cache里面找
	// 再从dao里面找
	u, err := r.udao.FindById(ctx, id)
	if err != nil {
		return domain.User{}, err
	}
	// 找到了回写cache

	return domain.User{
		Id:       u.Id,
		Email:    u.Email,
		Password: u.Password,
	}, nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (domain.User, error) {
	u, err := r.udao.FindByEmail(ctx, email)
	if err != nil {
		return domain.User{}, err
	}
	return domain.User{
		Id:       u.Id,
		Email:    u.Email,
		Password: u.Password,
	}, nil
}

func (r *UserRepository) Create(ctx context.Context, u domain.User) error {
	return r.udao.Insert(ctx, dao.User{
		Email:    u.Email,
		Password: u.Password,
	})
	// 在这里操作缓存
}

func (r *UserRepository) CreateWordpressInfo(ctx context.Context, wpui domain.UserWordpressInfo) error {
	return r.wpudao.Insert(ctx, dao.UserWordpressInfo{
		Uid:   wpui.Uid,
		WPuid: wpui.WPuid,
	})
	// 在这里操作缓存
}
