/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-01 19:59:02
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-09 18:40:31
 * @FilePath: \negaihoshi\server\src\repository\treehole.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package repository

import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository/dao"
	"time"

	"github.com/gin-gonic/gin"
)

type TreeHoleRepository struct {
	dao *dao.TreeHoleDAO
}

func NewTreeHoleRepository(dao *dao.TreeHoleDAO) *TreeHoleRepository {
	return &TreeHoleRepository{
		dao: dao,
	}
}

func (t *TreeHoleRepository) Create(ctx *gin.Context, treeHole domain.TreeHole) error {
	return t.dao.Insert(ctx, dao.TreeHole{
		Content: treeHole.Content,
		UserId:  treeHole.UserId,
	})
}

func (r *TreeHoleRepository) GetList(ctx *gin.Context, offset, limit int) ([]domain.TreeHole, error) {
	results := []domain.TreeHole{}
	mess, err := r.dao.FindByPage(ctx, offset, limit)
	if err != nil {
		return results, err
	}
	for _, m := range mess {
		seconds := m.Ctime / 1000
		nanoseconds := (m.Ctime % 1000) * 1e6
		t := time.Unix(seconds, nanoseconds)
		results = append(results, domain.TreeHole{
			Id:      m.Id,
			Content: m.Content,
			UserId:  m.UserId,
			Ctime:   t,
		})
	}
	return results, nil
}

func (r *TreeHoleRepository) GetListByUser(ctx *gin.Context, userId int64, offset, limit int) ([]domain.TreeHole, error) {
	results := []domain.TreeHole{}
	mess, err := r.dao.FindByUserAndPage(ctx, userId, offset, limit)
	if err != nil {
		return results, err
	}
	for _, m := range mess {
		seconds := m.Ctime / 1000
		nanoseconds := (m.Ctime % 1000) * 1e6
		t := time.Unix(seconds, nanoseconds)
		results = append(results, domain.TreeHole{
			Id:      m.Id,
			Content: m.Content,
			UserId:  m.UserId,
			Ctime:   t,
		})
	}
	return results, nil
}

func (r *TreeHoleRepository) GetById(ctx *gin.Context, id int64) (domain.TreeHole, error) {
	mess, err := r.dao.FindById(ctx, id)
	if err != nil {
		return domain.TreeHole{}, err
	}
	seconds := mess.Ctime / 1000
	nanoseconds := (mess.Ctime % 1000) * 1e6
	t := time.Unix(seconds, nanoseconds)
	return domain.TreeHole{
		Id:      mess.Id,
		Content: mess.Content,
		UserId:  mess.UserId,
		Ctime:   t,
	}, nil
}

func (r *TreeHoleRepository) Delete(ctx *gin.Context, id int64) error {
	return r.dao.DeleteById(ctx, id)
}
