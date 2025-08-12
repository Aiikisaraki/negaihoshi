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
	"encoding/json"
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository/dao"
	"strconv"
	"time"

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
	urs, err := r.redisClient.Get(ctx, "userInfo-"+strconv.FormatInt(id, 10)).Result()
	if err == nil {
		var u dao.User
		err = json.Unmarshal([]byte(urs), &u)
		if err == nil {
			return domain.User{
				Id:       u.Id,
				Username: u.Username,
				Email:    u.Email,
				Password: u.Password,
			}, nil
		}
	}
	// 再从dao里面找
	u, err := r.udao.FindById(ctx, id)
	if err != nil {
		return domain.User{}, err
	}
	// 找到了回写cache
	dataJson, err := json.Marshal(u)
	if err != nil {
		return domain.User{}, err
	}
	r.redisClient.Set(ctx, "userInfo-"+strconv.FormatInt(id, 10), dataJson, 4320*time.Hour)

	return domain.User{
		Id:       u.Id,
		Username: u.Username,
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
		Username: u.Username,
		Email:    u.Email,
		Password: u.Password,
	}, nil
}

func (r *UserRepository) Create(ctx context.Context, u domain.User) error {
	insertData := dao.User{
		Username: u.Username,
		Email:    u.Email,
		Password: u.Password,
	}
	err := r.udao.Insert(ctx, insertData)
	if err != nil {
		return err
	}
	// 在这里操作缓存
	uinfo, err := r.udao.FindByEmail(ctx, u.Email)
	if err != nil {
		return err
	}
	dataJson, err := json.Marshal(uinfo)
	if err != nil {
		return err
	}
	r.redisClient.Set(ctx, "userInfo-"+strconv.FormatInt(uinfo.Id, 10), dataJson, 4320*time.Hour)
	return nil
}

func (r *UserRepository) CreateWordpressInfo(ctx context.Context, wpui domain.UserWordpressInfo) error {
	insertData := dao.UserWordpressInfo{
		Uid:      wpui.Uid,
		WPuname:  wpui.WPuname,
		WPApiKey: wpui.WPApiKey,
	}
	err := r.wpudao.Insert(ctx, insertData)
	if err != nil {
		return err
	}
	// 在这里操作缓存
	dataJson, err := json.Marshal(insertData)
	if err != nil {
		return err
	}
	r.redisClient.Set(ctx, "userWPInfo-"+strconv.FormatInt(insertData.Uid, 10), dataJson, 4320*time.Hour)
	return nil
}

func (r *UserRepository) FindWordpressInfoByUid(ctx context.Context, uid int64) (domain.UserWordpressInfo, error) {
	var uwpinfo dao.UserWordpressInfo
	var err error
	var t time.Time
	var wordpessSiteInfo domain.WordpressSite
	var seconds int64
	// 先从cache里面找
	// urs, err := r.redisClient.Get(ctx, "userWPInfo-"+strconv.FormatInt(uid, 10)).Result()
	// var uwpinfo dao.UserWordpressInfo
	// err = json.Unmarshal([]byte(urs), &uwpinfo)

	// seconds := uwpinfo.Ctime / 1000
	// nanoseconds := (uwpinfo.Ctime % 1000) * 1e6
	// t := time.Unix(seconds, nanoseconds)

	// wordpessSiteInfo := domain.WordpressSite{
	// 	Id:  uwpinfo.SiteWhiteList.Id,
	// 	Url: uwpinfo.SiteWhiteList.WPSiteUrl,
	// }

	// if err == nil {
	// 	return domain.UserWordpressInfo{
	// 		Id:       uwpinfo.Id,
	// 		Uid:      uwpinfo.Uid,
	// 		WPuname:  uwpinfo.WPuname,
	// 		WPApiKey: uwpinfo.WPApiKey,
	// 		Ctime:    t,
	// 		SiteInfo: wordpessSiteInfo,
	// 	}, nil
	// }
	// 再从dao里面找
	uwpinfo, err = r.wpudao.FindByUid(ctx, uid)
	if err != nil {
		return domain.UserWordpressInfo{}, err
	}
	// 找到了回写cache
	dataJson, err := json.Marshal(uwpinfo)
	if err != nil {
		return domain.UserWordpressInfo{}, err
	}

	wordpessSiteInfo = domain.WordpressSite{
		Id:  uwpinfo.SiteWhiteList.Id,
		Url: uwpinfo.SiteWhiteList.WPSiteUrl,
	}

	seconds = uwpinfo.Ctime / 1000
	nanoseconds := (uwpinfo.Ctime % 1000) * 1e6
	t = time.Unix(seconds, nanoseconds)

	r.redisClient.Set(ctx, "userInfo-"+strconv.FormatInt(uid, 10), dataJson, 4320*time.Hour)
	return domain.UserWordpressInfo{
		Id:       uwpinfo.Id,
		Uid:      uwpinfo.Uid,
		WPuname:  uwpinfo.WPuname,
		WPApiKey: uwpinfo.WPApiKey,
		Ctime:    t,
		SiteInfo: wordpessSiteInfo,
	}, nil
}

func (r *UserRepository) DeleteWordpressInfoByUid(ctx context.Context, uid int64) error {
	err := r.wpudao.DeleteByUid(ctx, uid)
	if err != nil {
		return err
	}
	// 在这里操作缓存
	r.redisClient.Del(ctx, "userWPInfo-"+strconv.FormatInt(uid, 10))
	return nil
}

func (r *UserRepository) FindByUsername(ctx context.Context, username string) (domain.User, error) {
	u, err := r.udao.FindByUsername(ctx, username)
	if err != nil {
		return domain.User{}, err
	}
	return domain.User{
		Id:       u.Id,
		Username: u.Username,
		Email:    u.Email,
		Password: u.Password,
	}, nil
}
