package service

import (
	"context"
	"errors"

	"negaihoshi/server/src/repository/dao"
)

var (
	ErrInvalidContent = errors.New("无效的内容标识")
)

type InteractionService struct {
	dao *dao.InteractionDAO
}

func NewInteractionService(d *dao.InteractionDAO) *InteractionService {
	return &InteractionService{dao: d}
}

func (s *InteractionService) Like(ctx context.Context, contentId int64, isPost bool, userId int64) error {
	if contentId <= 0 || userId <= 0 {
		return ErrInvalidContent
	}
	_, err := s.dao.AddLikeOnce(ctx, contentId, isPost, userId)
	return err
}

func (s *InteractionService) Unlike(ctx context.Context, contentId int64, isPost bool, userId int64) error {
	if contentId <= 0 || userId <= 0 {
		return ErrInvalidContent
	}
	return s.dao.RemoveLike(ctx, contentId, isPost, userId)
}

func (s *InteractionService) CountLikes(ctx context.Context, contentId int64, isPost bool) (int64, error) {
	if contentId <= 0 {
		return 0, ErrInvalidContent
	}
	return s.dao.CountLikes(ctx, contentId, isPost)
}

func (s *InteractionService) IsLiked(ctx context.Context, contentId int64, isPost bool, userId int64) (bool, error) {
	if contentId <= 0 || userId <= 0 {
		return false, ErrInvalidContent
	}
	return s.dao.HasLiked(ctx, contentId, isPost, userId)
}

func (s *InteractionService) AddComment(ctx context.Context, contentId int64, isPost bool, userId int64, content string) error {
	if contentId <= 0 || userId <= 0 || content == "" {
		return ErrInvalidContent
	}
	return s.dao.AddComment(ctx, contentId, isPost, userId, content)
}

func (s *InteractionService) ListComments(ctx context.Context, contentId int64, isPost bool, limit int, offset int) ([]dao.Comment, error) {
	if contentId <= 0 {
		return nil, ErrInvalidContent
	}
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.dao.ListComments(ctx, contentId, isPost, limit, offset)
}

func (s *InteractionService) Follow(ctx context.Context, followerId, followeeId int64) error {
	if followerId <= 0 || followeeId <= 0 {
		return ErrInvalidContent
	}
	return s.dao.Follow(ctx, followerId, followeeId)
}

func (s *InteractionService) Unfollow(ctx context.Context, followerId, followeeId int64) error {
	if followerId <= 0 || followeeId <= 0 {
		return ErrInvalidContent
	}
	return s.dao.Unfollow(ctx, followerId, followeeId)
}

func (s *InteractionService) CountFollowing(ctx context.Context, userId int64) (int64, error) {
	if userId <= 0 {
		return 0, ErrInvalidContent
	}
	return s.dao.CountFollowing(ctx, userId)
}

func (s *InteractionService) CountFollowers(ctx context.Context, userId int64) (int64, error) {
	if userId <= 0 {
		return 0, ErrInvalidContent
	}
	return s.dao.CountFollowers(ctx, userId)
}

// IsFollowing 检查用户是否已关注另一个用户
func (s *InteractionService) IsFollowing(ctx context.Context, followerId, followeeId int64) (bool, error) {
	if followerId <= 0 || followeeId <= 0 {
		return false, ErrInvalidContent
	}
	return s.dao.HasFollowed(ctx, followerId, followeeId)
}
