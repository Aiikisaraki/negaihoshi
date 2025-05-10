/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-08 21:28:09
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-09 21:13:21
 * @FilePath: \negaihoshi\server\src\repository\dao\status.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package dao

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Status struct {
	Id      int64
	Content string
	UserId  int64
	Ctime   int64
	Utime   int64
}

type StatusDAO struct {
	db *gorm.DB
}

func NewStatusDAO(db *gorm.DB) *StatusDAO {
	return &StatusDAO{db: db}
}

func (dao *StatusDAO) Insert(ctx context.Context, status Status) error {
	// 存毫秒数
	now := time.Now().UnixMilli()
	status.Utime = now
	status.Ctime = now
	err := dao.db.WithContext(ctx).Create(&status).Error
	return err
}
