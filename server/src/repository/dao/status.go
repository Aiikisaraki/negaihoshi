/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-08 21:28:09
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-22 20:55:00
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

func (dao *StatusDAO) FindById(ctx context.Context, id int64) (Status, error) {
	var status Status
	err := dao.db.Where("id =?", id).First(&status).Error
	return status, err
}

func (dao *StatusDAO) Update(ctx context.Context, status Status) error {
	status.Utime = time.Now().UnixMilli()
	err := dao.db.WithContext(ctx).Save(&status).Error
	return err
}
