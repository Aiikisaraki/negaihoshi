/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-23 11:10:48
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-11 10:18:35
 * @FilePath: \nekaihoshi\server\src\repository\dao\user_wordpress_info.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package dao

import (
	"context"
	"errors"
	"time"

	"github.com/go-sql-driver/mysql"
	"gorm.io/gorm"
)

var (
	ErrUserDuplicateUid          = errors.New("用户已存在绑定记录")
	ErrUserWordpressInfoNotFound = gorm.ErrRecordNotFound
)

type UserWordpressInfoDAO struct {
	db *gorm.DB
}

func NewUserWordpressInfoDAO(db *gorm.DB) *UserWordpressInfoDAO {
	return &UserWordpressInfoDAO{
		db: db,
	}
}

type UserWordpressInfo struct {
	Id int64 `gorm:"primaryKey,autoIncrement"`
	// 设置为唯一索引
	Uid             int64 `gorm:"unique"`
	WPuname         string
	WPApiKey        string
	Ctime           int64
	Utime           int64
	SiteWhiteListId int64              `sql:"type:integer REFERENCES wordpress_whitelist(id) on update no action on delete no action"`
	SiteWhiteList   WordpressWhitelist `gorm:"foreignkey:SiteWhiteListId;association_foreignkey:Id"`
}

type WordpressWhitelist struct {
	Id        int64  `gorm:"primaryKey,autoIncrement"`
	WPSiteUrl string `gorm:"unique"`
}

func (dao *UserWordpressInfoDAO) Insert(ctx context.Context, wpui UserWordpressInfo) error {
	now := time.Now().UnixMilli()
	wpui.Utime = now
	wpui.Ctime = now
	err := dao.db.WithContext(ctx).Create(&wpui).Error
	if mysqlErr, ok := err.(*mysql.MySQLError); ok {
		const uniqueConflictsErrNo uint16 = 1062
		if mysqlErr.Number == uniqueConflictsErrNo {
			// 用户记录冲突
			return ErrUserDuplicateUid
		}
	}
	return err
}

func (dao *UserWordpressInfoDAO) FindByUid(ctx context.Context, uid int64) (UserWordpressInfo, error) {
	var uwpinfo UserWordpressInfo
	err := dao.db.WithContext(ctx).Preload("SiteWhiteList").Where("uid = ?", uid).First(&uwpinfo).Error
	return uwpinfo, err
}

func (dao *UserWordpressInfoDAO) DeleteByUid(ctx context.Context, uid int64) error {
	return dao.db.WithContext(ctx).Where("uid = ?", uid).Delete(&UserWordpressInfo{}).Error
}
