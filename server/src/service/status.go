package service

import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository"

	"github.com/gin-gonic/gin"
)

type StatusService struct {
	repo *repository.StatusRepository
}

func NewStatusService(repo *repository.StatusRepository) *StatusService {
	return &StatusService{repo: repo}
}

func (s *StatusService) CreateStatusMessage(c *gin.Context, status domain.Status) error {
	return nil
}
