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
	return nil
}

func (s *StatusAndPostsService) CreatePostsMessage(c *gin.Context, posts domain.Posts) error {
	return nil
}
