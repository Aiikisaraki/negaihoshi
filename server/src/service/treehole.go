/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-01 19:58:32
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-09 18:40:13
 * @FilePath: \negaihoshi\server\src\service\treehole.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package service

import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository"
	"time"

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

// 管理后台相关方法

// 获取内容统计信息
func (t *TreeHoleService) GetContentStats() (map[string]interface{}, error) {
	// 暂时返回示例数据
	return map[string]interface{}{
		"total_treeholes":   1250,
		"pending_review":    15,
		"approved_content":  1200,
		"rejected_content":  35,
		"new_content_today": 25,
		"new_content_week":  180,
	}, nil
}

// 获取树洞列表（管理后台）
func (t *TreeHoleService) GetTreeholeListForAdmin(page, size int, status string) ([]domain.TreeHole, int64, error) {
	// 暂时返回示例数据
	treeholes := []domain.TreeHole{
		{
			Id:      1,
			Content: "这是一条测试树洞消息",
			Ctime:   time.Now().Add(-time.Hour),
		},
		{
			Id:      2,
			Content: "另一条测试消息",
			Ctime:   time.Now().Add(-2 * time.Hour),
		},
	}

	return treeholes, int64(len(treeholes)), nil
}

// 删除树洞（管理后台）
func (t *TreeHoleService) DeleteTreeholeForAdmin(treeholeID int64) error {
	// 暂时返回nil，实际实现时需要删除数据库记录
	return nil
}

// 审核通过树洞
func (t *TreeHoleService) ApproveTreehole(treeholeID int64) error {
	// 暂时返回nil，实际实现时需要更新状态
	return nil
}

// 审核拒绝树洞
func (t *TreeHoleService) RejectTreehole(treeholeID int64, reason string) error {
	// 暂时返回nil，实际实现时需要更新状态
	return nil
}
