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
	Uid   int64 `gorm:"unique"`
	WPuid int64
	Ctime int64
	Utime int64
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
