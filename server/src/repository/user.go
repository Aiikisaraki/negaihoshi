/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 15:07:13
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-11 10:25:52
 * @FilePath: \nekaihoshi\server\src\repository\user.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package repository

import (
	"context"

	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository/dao"
)

type UserRepository struct {
	userDAO *dao.UserDAO
}

func NewUserRepository(userDAO *dao.UserDAO) *UserRepository {
	return &UserRepository{
		userDAO: userDAO,
	}
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	daoUser := &dao.User{
		Username: user.Username,
		Email:    user.Email,
		Password: user.Password,
		Nickname: user.Nickname,
		Bio:      user.Bio,
		Avatar:   user.Avatar,
		Phone:    user.Phone,
		Location: user.Location,
		Website:  user.Website,
	}

	return r.userDAO.Insert(daoUser)
}

func (r *UserRepository) FindById(ctx context.Context, id int64) (*domain.User, error) {
	daoUser, err := r.userDAO.FindById(id)
	if err != nil {
		return nil, err
	}

	return &domain.User{
		Id:       daoUser.Id,
		Username: daoUser.Username,
		Email:    daoUser.Email,
		Password: daoUser.Password,
		Nickname: daoUser.Nickname,
		Bio:      daoUser.Bio,
		Avatar:   daoUser.Avatar,
		Phone:    daoUser.Phone,
		Location: daoUser.Location,
		Website:  daoUser.Website,
		Ctime:    daoUser.Ctime,
		Utime:    daoUser.Utime,
	}, nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	daoUser, err := r.userDAO.FindByEmail(email)
	if err != nil {
		return nil, err
	}

	return &domain.User{
		Id:       daoUser.Id,
		Username: daoUser.Username,
		Email:    daoUser.Email,
		Password: daoUser.Password,
		Nickname: daoUser.Nickname,
		Bio:      daoUser.Bio,
		Avatar:   daoUser.Avatar,
		Phone:    daoUser.Phone,
		Location: daoUser.Location,
		Website:  daoUser.Website,
		Ctime:    daoUser.Ctime,
		Utime:    daoUser.Utime,
	}, nil
}

func (r *UserRepository) FindByUsername(ctx context.Context, username string) (*domain.User, error) {
	daoUser, err := r.userDAO.FindByUsername(username)
	if err != nil {
		return nil, err
	}

	return &domain.User{
		Id:       daoUser.Id,
		Username: daoUser.Username,
		Email:    daoUser.Email,
		Password: daoUser.Password,
		Nickname: daoUser.Nickname,
		Bio:      daoUser.Bio,
		Avatar:   daoUser.Avatar,
		Phone:    daoUser.Phone,
		Location: daoUser.Location,
		Website:  daoUser.Website,
		Ctime:    daoUser.Ctime,
		Utime:    daoUser.Utime,
	}, nil
}

func (r *UserRepository) UpdateProfile(ctx context.Context, id int64, profile *domain.ProfileUpdateRequest) error {
	return r.userDAO.UpdateProfile(id, profile)
}

func (r *UserRepository) GetTotalUserCount(ctx context.Context) (int64, error) {
	// 实现获取用户总数的逻辑
	return 0, nil
}
