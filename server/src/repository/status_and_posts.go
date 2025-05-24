/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-08 21:28:29
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-24 22:48:42
 * @FilePath: \negaihoshi\server\src\repository\status.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

package repository

import (
	"negaihoshi/server/src/domain"
	"negaihoshi/server/src/repository/dao"

	// "time"

	"github.com/gin-gonic/gin"
)

type StatusAndPostsRepository struct {
	sdao *dao.StatusDAO
	pdao *dao.PostsDAO
}

func NewStatusAndPostsRepository(sdao *dao.StatusDAO, pdao *dao.PostsDAO) *StatusAndPostsRepository {
	return &StatusAndPostsRepository{
		sdao: sdao,
		pdao: pdao,
	}
}

func (s *StatusAndPostsRepository) CreateStatus(ctx *gin.Context, status domain.Status) error {
	return s.sdao.Insert(ctx, dao.Status{
		Content: status.Content,
		UserId:  status.UserId,
	})
}

func (s *StatusAndPostsRepository) CreatePosts(ctx *gin.Context, posts domain.Posts) error {
	return s.pdao.Insert(ctx, dao.Posts{
		Title:   posts.Title,
		Content: posts.Content,
		UserId:  posts.UserId,
	})
}

func (s *StatusAndPostsRepository) EditStatus(ctx *gin.Context, status domain.Status) error {
	return s.sdao.Update(ctx, dao.Status{
		Id:      status.Id,
		Content: status.Content,
		UserId:  status.UserId,
	})
}

func (s *StatusAndPostsRepository) EditPosts(ctx *gin.Context, posts domain.Posts) error {
	return s.pdao.Update(ctx, dao.Posts{
		Id:      posts.Id,
		Title:   posts.Title,
		Content: posts.Content,
		UserId:  posts.UserId,
	})
}

func (s *StatusAndPostsRepository) GetPosts(c *gin.Context, id int64) (domain.Posts, error) {
	res, err := s.pdao.FindById(c, id)
	return domain.Posts{
		Id:      res.Id,
		Title:   res.Title,
		Content: res.Content,
		UserId:  res.UserId,
	}, err
}

func (s *StatusAndPostsRepository) GetStatus(c *gin.Context, id int64) (domain.Status, error) {
	res, err := s.sdao.FindById(c, id)
	return domain.Status{
		Id:      res.Id,
		Content: res.Content,
		UserId:  res.UserId,
	}, err
}

func (s *StatusAndPostsRepository) FindStatusByUser(ctx *gin.Context, uid int64) ([]domain.Status, error) {
	res, err := s.sdao.FindByUid(ctx, uid)
	if err != nil {
		return nil, err
	}

	return func(res []dao.Status) []domain.Status {
		var status []domain.Status
		for _, v := range res {
			status = append(status, domain.Status{
				Id:      v.Id,
				Content: v.Content,
				UserId:  v.UserId,
			})
		}
		return status
	}(res), nil
}

func (s *StatusAndPostsRepository) FindPostsByUser(ctx *gin.Context, uid int64) ([]domain.Posts, error) {
	res, err := s.pdao.FindByUid(ctx, uid)
	if err != nil {
		return nil, err
	}

	return func(res []dao.Posts) []domain.Posts {
		var posts []domain.Posts
		for _, v := range res {
			posts = append(posts, domain.Posts{
				Id:      v.Id,
				Title:   v.Title,
				Content: v.Content,
				UserId:  v.UserId,
			})
		}
		return posts
	}(res), nil
}
