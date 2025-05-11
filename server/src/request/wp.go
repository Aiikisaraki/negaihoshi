/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-23 10:38:53
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-10 20:23:41
 * @FilePath: \negaihoshi\server\src\request\wp.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package request

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strconv"
)

type WpRequest struct{}

func NewWpRequest() *WpRequest {
	return &WpRequest{}
}

func (w *WpRequest) GetWpUserData(siteUrl string, uid int64) (*http.Response, error) {
	url := siteUrl + "/wp-json/wp/v2/users/" + strconv.FormatInt(uid, 10)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		panic("创建请求失败: " + err.Error())
	}
	return http.DefaultClient.Do(req)
}

func (w *WpRequest) TransferStatus(siteUrl string, uid int64, content string, userName string, apiKey string) (*http.Response, error) {
	url := siteUrl + "/wp-json/wp/v2/shuoshuo"
	// 1. 准备JSON请求体
	payload := map[string]interface{}{
		"status": "publish",
		"title": map[string]interface{}{
			"rendered": "",
		},
		"content": map[string]interface{}{
			"raw":       content,
			"protected": false,
		},
		"author": uid,
	}
	jsonData, err := json.Marshal(payload)
	if err != nil {
		panic("JSON序列化失败: " + err.Error())
	}
	// 2. 创建请求对象
	// 由于 bytes 未定义，需要导入 "bytes" 包，这里假设已经导入，使用正确的 URL 变量
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		panic("创建请求失败: " + err.Error())
	}
	// 3. 设置请求头
	req.Header.Set("Content-Type", "application/json")
	// req.Header.Set("Authorization", "Bearer "+apiKey)

	// 4. 设置Basic Auth
	req.SetBasicAuth(userName, apiKey)

	// 5. 发送请求
	return http.DefaultClient.Do(req)
}

func (w *WpRequest) TransferPosts(siteUrl string, uid int64, content string, userName string, apiKey string, title string) (*http.Response, error) {
	url := siteUrl + "/wp-json/wp/v2/posts"
	// 1. 准备JSON请求体
	payload := map[string]interface{}{
		"status": "publish",
		"title": map[string]interface{}{
			"rendered": title,
		},
		"content": map[string]interface{}{
			"raw":       content,
			"protected": false,
		},
		"author": uid,
	}
	jsonData, err := json.Marshal(payload)
	if err != nil {
		panic("JSON序列化失败: " + err.Error())
	}
	// 2. 创建请求对象
	// 由于 bytes 未定义，需要导入 "bytes" 包，这里假设已经导入，使用正确的 URL 变量
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		panic("创建请求失败: " + err.Error())
	}
	// 3. 设置请求头
	req.Header.Set("Content-Type", "application/json")
	// req.Header.Set("Authorization", "Bearer "+apiKey)

	// 4. 设置Basic Auth
	req.SetBasicAuth(userName, apiKey)

	// 5. 发送请求
	return http.DefaultClient.Do(req)
}
