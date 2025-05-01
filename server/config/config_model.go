/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-01 16:26:20
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-01 16:30:03
 * @FilePath: \negaihoshi\server\config\config_model.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package config

type Config struct {
	FrontendPrefix []string `json:"frontend-prefix"`
	ServerPort     string   `json:"server-port"`
	Database       struct {
		Type         string `json:"type"`
		Host         string `json:"host"`
		Port         string `json:"port"`
		User         string `json:"user"`
		Password     string `json:"password"`
		DatabaseName string `json:"database-name"`
	} `json:"database"`
	Redis struct {
		Host     string `json:"host"`
		Port     string `json:"port"`
		Password string `json:"password"`
	}
}
