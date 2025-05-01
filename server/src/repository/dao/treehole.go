package dao

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type TreeHole struct {
	Id      int64
	Content string
	UserId  int64
	Ctime   int64
	Utime   int64
}

type TreeHoleDAO struct {
	db *gorm.DB
}

func NewTreeHoleDAO(db *gorm.DB) *TreeHoleDAO {
	return &TreeHoleDAO{db: db}
}

func (dao *TreeHoleDAO) Insert(ctx context.Context, treeHole TreeHole) error {
	// 存毫秒数
	now := time.Now().UnixMilli()
	treeHole.Utime = now
	treeHole.Ctime = now
	err := dao.db.WithContext(ctx).Create(&treeHole).Error
	return err
}

func (dao *TreeHoleDAO) FindByPage(ctx context.Context, offset, limit int) ([]TreeHole, error) {
	var treeHoles []TreeHole
	err := dao.db.Offset(offset).Limit(limit).Find(&treeHoles).Error
	return treeHoles, err
}

func (dao *TreeHoleDAO) FindByUserAndPage(ctx context.Context, userId int64, offset, limit int) ([]TreeHole, error) {
	var treeHoles []TreeHole
	err := dao.db.Offset(offset).Limit(limit).Where("user_id = ?", userId).Find(&treeHoles).Error
	return treeHoles, err
}

func (dao *TreeHoleDAO) FindById(ctx context.Context, id int64) (TreeHole, error) {
	var treeHole TreeHole
	err := dao.db.Where("id =?", id).First(&treeHole).Error
	return treeHole, err
}

func (dao *TreeHoleDAO) DeleteById(ctx context.Context, id int64) error {
	err := dao.db.Where("id = ?", id).Delete(&TreeHole{}).Error
	return err
}
