/*
 * @Author: Aiikisaraki morikawa@kimisui56.work
 * @Date: 2025-05-10 17:32:11
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-11 11:08:57
 * @FilePath: \negaihoshi\server\src\repository\status.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-08 21:28:29
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-09 22:36:01
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
