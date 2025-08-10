package service

import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository"

	"github.com/gin-gonic/gin"
)

type StatusAndPostsService struct {
	repo *repository.StatusAndPostsRepository
}

func NewStatusAndPostsService(repo *repository.StatusAndPostsRepository) *StatusAndPostsService {
	return &StatusAndPostsService{repo: repo}
}

func (s *StatusAndPostsService) CreateStatusMessage(c *gin.Context, status domain.Status) error {
	err := s.repo.CreateStatus(c, status)
	return err
}

func (s *StatusAndPostsService) CreatePostsMessage(c *gin.Context, posts domain.Posts) error {
	err := s.repo.CreatePosts(c, posts)
	return err
}

func (s *StatusAndPostsService) EditStatusMessage(c *gin.Context, status domain.Status) error {
	err := s.repo.EditStatus(c, status)
	return err
}

func (s *StatusAndPostsService) EditPostsMessage(c *gin.Context, posts domain.Posts) error {
	err := s.repo.EditPosts(c, posts)
	return err
}

func (s *StatusAndPostsService) GetPostFromThisSite(c *gin.Context, id int64) (domain.Posts, error) {
	return s.repo.GetPosts(c, id)
}

func (s *StatusAndPostsService) GetStatusFromThisSite(c *gin.Context, id int64) (domain.Status, error) {
	return s.repo.GetStatus(c, id)
}

func (s *StatusAndPostsService) GetStatusByUser(c *gin.Context, uid int64) ([]domain.Status, error) {
	return s.repo.FindStatusByUser(c, uid)
}

func (s *StatusAndPostsService) GetPostsByUser(c *gin.Context, uid int64) ([]domain.Posts, error) {
	return s.repo.FindPostsByUser(c, uid)
}

func (s *StatusAndPostsService) GetStatusMessageList(c *gin.Context) ([]domain.Status, error) {
	return s.repo.GetAllStatus(c)
}

func (s *StatusAndPostsService) GetPostsMessageList(c *gin.Context) ([]domain.Posts, error) {
	return s.repo.GetAllPosts(c)
}

func (s *StatusAndPostsService) DeleteStatus(c *gin.Context, id int64) error {
	err := s.repo.DeleteStatus(c, id)
	return err
}

func (s *StatusAndPostsService) DeletePosts(c *gin.Context, id int64) error {
	err := s.repo.DeletePosts(c, id)
	return err
}

// 管理后台相关方法

// 获取系统统计信息
func (s *StatusAndPostsService) GetSystemStats() (map[string]interface{}, error) {
	// 暂时返回示例数据
	return map[string]interface{}{
		"total_status":    850,
		"total_posts":     320,
		"system_uptime":   "15天 8小时 30分钟",
		"memory_usage":    "65%",
		"disk_usage":      "45%",
		"cpu_usage":       "23%",
		"active_sessions": 45,
	}, nil
}

// 获取动态列表（管理后台）
func (s *StatusAndPostsService) GetStatusListForAdmin(page, size int, status string) ([]domain.Status, int64, error) {
	// 暂时返回示例数据
	statuses := []domain.Status{
		{
			Id:      1,
			Content: "这是一条测试动态",
			UserId:  1,
		},
		{
			Id:      2,
			Content: "另一条测试动态",
			UserId:  2,
		},
	}

	return statuses, int64(len(statuses)), nil
}

// 删除动态（管理后台）
func (s *StatusAndPostsService) DeleteStatusForAdmin(statusID int64) error {
	// 暂时返回nil，实际实现时需要删除数据库记录
	return nil
}

// 审核通过动态
func (s *StatusAndPostsService) ApproveStatus(statusID int64) error {
	// 暂时返回nil，实际实现时需要更新状态
	return nil
}

// 审核拒绝动态
func (s *StatusAndPostsService) RejectStatus(statusID int64, reason string) error {
	// 暂时返回nil，实际实现时需要更新状态
	return nil
}
