/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-08 21:28:29
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-22 20:54:38
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
