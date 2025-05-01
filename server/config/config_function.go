/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-05-01 18:45:07
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-05-01 19:54:00
 * @FilePath: \negaihoshi\server\config\config_function.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package config

import (
	"encoding/json"
	"fmt"
	"os"
	"reflect"
)

func IsZero(i interface{}) bool {
	return reflect.ValueOf(i).IsZero()
}

type ConfigFunction struct {
	Config Config
}

func (c *ConfigFunction) ReadConfiguration(configPath string) error {

	// 读取配置文件
	config, err := os.ReadFile(configPath)
	if err != nil {
		fmt.Println("读取文件失败:", err)
		return err
	}
	err = json.Unmarshal(config, &c.Config) // 解析JSON数据到config变量中
	if err != nil {
		fmt.Println("解析 JSON 失败:", err)
		return err
	}
	fmt.Println("配置文件读取成功")
	return nil
}

func (c *ConfigFunction) GetDatabaseConfig() (string, string, string, string, string, string) {
	if IsZero(c.Config) {
		fmt.Println("config 未被赋值")
		return "", "", "", "", "", ""
	}
	return c.Config.Database.Type, c.Config.Database.Host, c.Config.Database.Port, c.Config.Database.User, c.Config.Database.Password, c.Config.Database.DatabaseName
}

func (c *ConfigFunction) GetRedisConfig() (string, string, string) {
	if IsZero(c.Config) {
		fmt.Println("config 未被赋值")
		return "", "", ""
	}
	return c.Config.Redis.Host, c.Config.Redis.Port, c.Config.Redis.Password
}

func (c *ConfigFunction) GetServerPort() string {
	if IsZero(c.Config) {
		fmt.Println("config 未被赋值")
		return ""
	}
	return c.Config.ServerPort
}

func (c *ConfigFunction) GetFrontendPrefix() []string {
	if IsZero(c.Config) {
		fmt.Println("config 未被赋值")
		return []string{}
	}
	return c.Config.FrontendPrefix
}
