/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-01 20:50:03
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-01 20:51:19
 * @FilePath: \negaihoshi\server\src\domain\treehole.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package domain

import "time"

type TreeHole struct {
	Id      int64
	Content string
	UserId  int64
	Ctime   time.Time
}
