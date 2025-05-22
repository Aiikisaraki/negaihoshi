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
