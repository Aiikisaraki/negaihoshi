/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-23 10:38:53
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-09 22:46:51
 * @FilePath: \negaihoshi\server\src\request\wp.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package request

import "net/http"

type WpRequest struct{}

func (w *WpRequest) Do(req *http.Request) (*http.Response, error) {
	return nil, nil
}
