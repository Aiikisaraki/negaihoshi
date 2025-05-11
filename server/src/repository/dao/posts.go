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

type Posts struct {
	Id      int64
	Title   string
	Content string
	UserId  int64
	Ctime   int64
	Utime   int64
}

type PostsDAO struct {
	db *gorm.DB
}

func NewPostsDAO(db *gorm.DB) *PostsDAO {
	return &PostsDAO{db: db}
}

func (dao *PostsDAO) Insert(ctx context.Context, posts Posts) error {
	// 存毫秒数
	now := time.Now().UnixMilli()
	posts.Utime = now
	posts.Ctime = now
	err := dao.db.WithContext(ctx).Create(&posts).Error
	return err
}
