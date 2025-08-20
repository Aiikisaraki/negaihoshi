package dao

import (
	"context"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Like struct {
	Id        int64 `gorm:"primaryKey;autoIncrement"`
	ContentId int64 `gorm:"index:idx_content;uniqueIndex:uidx_like"`
	IsPost    bool  `gorm:"index:idx_content;uniqueIndex:uidx_like"`
	UserId    int64 `gorm:"index:idx_user;uniqueIndex:uidx_like"`
	Ctime     int64 `gorm:"autoCreateTime:milli"`
}

type Comment struct {
	Id        int64  `gorm:"primaryKey;autoIncrement"`
	ContentId int64  `gorm:"index:idx_content"`
	IsPost    bool   `gorm:"index:idx_content"`
	UserId    int64  `gorm:"index:idx_user"`
	Content   string `gorm:"type:text"`
	Ctime     int64  `gorm:"autoCreateTime:milli"`
}

type Follow struct {
	Id         int64 `gorm:"primaryKey;autoIncrement"`
	FollowerId int64 `gorm:"index:idx_follow"`
	FolloweeId int64 `gorm:"index:idx_follow"`
	Ctime      int64 `gorm:"autoCreateTime:milli"`
}

type InteractionDAO struct {
	db *gorm.DB
}

func NewInteractionDAO(db *gorm.DB) *InteractionDAO {
	return &InteractionDAO{db: db}
}

func (d *InteractionDAO) InitTables(db *gorm.DB) error {
	return db.Set("gorm:table_options", "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci").AutoMigrate(&Like{}, &Comment{}, &Follow{})
}

func (d *InteractionDAO) AddLike(ctx context.Context, contentId int64, isPost bool, userId int64) error {
	return d.db.WithContext(ctx).Create(&Like{ContentId: contentId, IsPost: isPost, UserId: userId, Ctime: time.Now().UnixMilli()}).Error
}

// AddLikeOnce 原子插入，若已存在则不插入并返回 created=false
func (d *InteractionDAO) AddLikeOnce(ctx context.Context, contentId int64, isPost bool, userId int64) (created bool, err error) {
	res := d.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "content_id"}, {Name: "is_post"}, {Name: "user_id"}},
		DoNothing: true,
	}).Create(&Like{ContentId: contentId, IsPost: isPost, UserId: userId, Ctime: time.Now().UnixMilli()})
	return res.RowsAffected > 0, res.Error
}

func (d *InteractionDAO) RemoveLike(ctx context.Context, contentId int64, isPost bool, userId int64) error {
	return d.db.WithContext(ctx).Where("content_id=? AND is_post=? AND user_id=?", contentId, isPost, userId).Delete(&Like{}).Error
}

func (d *InteractionDAO) CountLikes(ctx context.Context, contentId int64, isPost bool) (int64, error) {
	var count int64
	err := d.db.WithContext(ctx).Model(&Like{}).Where("content_id=? AND is_post=?", contentId, isPost).Count(&count).Error
	return count, err
}

func (d *InteractionDAO) HasLiked(ctx context.Context, contentId int64, isPost bool, userId int64) (bool, error) {
	var count int64
	err := d.db.WithContext(ctx).Model(&Like{}).Where("content_id=? AND is_post=? AND user_id=?", contentId, isPost, userId).Count(&count).Error
	return count > 0, err
}

func (d *InteractionDAO) AddComment(ctx context.Context, contentId int64, isPost bool, userId int64, content string) error {
	return d.db.WithContext(ctx).Create(&Comment{ContentId: contentId, IsPost: isPost, UserId: userId, Content: content, Ctime: time.Now().UnixMilli()}).Error
}

func (d *InteractionDAO) ListComments(ctx context.Context, contentId int64, isPost bool, limit int, offset int) ([]Comment, error) {
	var items []Comment
	err := d.db.WithContext(ctx).Where("content_id=? AND is_post=?", contentId, isPost).Order("id DESC").Limit(limit).Offset(offset).Find(&items).Error
	return items, err
}

func (d *InteractionDAO) Follow(ctx context.Context, followerId, followeeId int64) error {
	return d.db.WithContext(ctx).Create(&Follow{FollowerId: followerId, FolloweeId: followeeId, Ctime: time.Now().UnixMilli()}).Error
}

func (d *InteractionDAO) Unfollow(ctx context.Context, followerId, followeeId int64) error {
	return d.db.WithContext(ctx).Where("follower_id=? AND followee_id=?", followerId, followeeId).Delete(&Follow{}).Error
}

func (d *InteractionDAO) CountFollowing(ctx context.Context, userId int64) (int64, error) {
	var count int64
	err := d.db.WithContext(ctx).Model(&Follow{}).Where("follower_id=?", userId).Count(&count).Error
	return count, err
}

func (d *InteractionDAO) CountFollowers(ctx context.Context, userId int64) (int64, error) {
	var count int64
	err := d.db.WithContext(ctx).Model(&Follow{}).Where("followee_id=?", userId).Count(&count).Error
	return count, err
}

// HasFollowed 检查用户是否已关注另一个用户
func (d *InteractionDAO) HasFollowed(ctx context.Context, followerId, followeeId int64) (bool, error) {
	var count int64
	err := d.db.WithContext(ctx).Model(&Follow{}).Where("follower_id=? AND followee_id=?", followerId, followeeId).Count(&count).Error
	return count > 0, err
}
