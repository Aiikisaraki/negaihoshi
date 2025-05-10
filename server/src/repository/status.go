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

type StatusRepository struct {
	dao *dao.StatusDAO
}

func NewStatusRepository(dao *dao.StatusDAO) *StatusRepository {
	return &StatusRepository{
		dao: dao,
	}
}

func (s *StatusRepository) Create(ctx *gin.Context, status domain.Status) error {
	return s.dao.Insert(ctx, dao.Status{
		Content: status.Content,
		UserId:  status.UserId,
	})
}
