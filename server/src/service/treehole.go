/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-01 19:58:32
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-01 21:25:14
 * @FilePath: \negaihoshi\server\src\service\treehole.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package service

import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository"

	"github.com/gin-gonic/gin"
)

type TreeHoleService struct {
	repo *repository.TreeHoleRepository
}

func NewTreeHoleService(repo *repository.TreeHoleRepository) *TreeHoleService {
	return &TreeHoleService{repo: repo}
}

func (t *TreeHoleService) CreateTreeHoleMessage(ctx *gin.Context, treeHole domain.TreeHole) error {
	return t.repo.Create(ctx, treeHole)
}

func (t *TreeHoleService) GetTreeHoleMessageList(ctx *gin.Context, pageNum, pageSize int) ([]domain.TreeHole, error) {
	// 计算偏移量
	offset := (pageNum - 1) * pageSize
	// 调用仓库层方法并传递偏移量和限制数量
	return t.repo.GetList(ctx, offset, pageSize)
}

func (t *TreeHoleService) GetUserTreeHoleMessageList(ctx *gin.Context, userId int64, pageNum, pageSize int) ([]domain.TreeHole, error) {
	// 计算偏移量
	offset := (pageNum - 1) * pageSize
	// 调用仓库层方法并传递偏移量和限制数量
	return t.repo.GetListByUser(ctx, userId, offset, pageSize)
}

func (t *TreeHoleService) GetTreeHoleMessage(ctx *gin.Context, id int64) (domain.TreeHole, error) {
	// 调用仓库层方法并传递偏移量和限制数量
	return t.repo.GetById(ctx, id)
}

func (t *TreeHoleService) DeleteTreeHoleMessage(ctx *gin.Context, id int64) error {
	return t.repo.Delete(ctx, id)
}
