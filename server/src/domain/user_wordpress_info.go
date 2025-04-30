/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-23 11:35:57
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-04-24 08:49:55
 * @FilePath: \nekaihoshi\server\src\domain\user_wordpress_info.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package domain

import "time"

type UserWordpressInfo struct {
	Id       int64
	Uid      int64
	WPuname  string
	WPApiKey string
	Ctime    time.Time
}
