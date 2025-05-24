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
