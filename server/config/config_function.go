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
	"path/filepath"
	"reflect"
)

func IsZero(i interface{}) bool {
	return reflect.ValueOf(i).IsZero()
}

type ConfigFunction struct {
	Config Config
}

// ReadConfiguration 读取配置文件，如果不存在则自动生成
func (c *ConfigFunction) ReadConfiguration(configPath string) error {
	// 检查配置文件是否存在
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		fmt.Printf("配置文件不存在: %s\n", configPath)

		// 尝试自动生成配置文件
		if err := c.autoGenerateConfig(configPath); err != nil {
			return fmt.Errorf("自动生成配置文件失败: %v", err)
		}
	}

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

// autoGenerateConfig 自动生成配置文件
func (c *ConfigFunction) autoGenerateConfig(configPath string) error {
	// 获取项目根目录（假设配置文件在项目根目录的config.json）
	projectRoot := c.findProjectRoot()
	globalConfigPath := filepath.Join(projectRoot, "config.json")

	// 创建配置生成器
	generator := NewConfigGenerator(globalConfigPath, configPath)

	// 生成配置文件
	return generator.GenerateConfigIfNotExists()
}

// findProjectRoot 查找项目根目录
func (c *ConfigFunction) findProjectRoot() string {
	// 从当前工作目录开始向上查找，直到找到包含config.json或go.mod的目录
	currentDir, err := os.Getwd()
	if err != nil {
		return "."
	}

	// 检查当前目录是否包含项目标识文件
	for {
		if c.isProjectRoot(currentDir) {
			return currentDir
		}

		// 向上查找父目录
		parentDir := filepath.Dir(currentDir)
		if parentDir == currentDir {
			// 已经到达根目录
			break
		}
		currentDir = parentDir
	}

	// 如果找不到项目根目录，返回当前目录
	return "."
}

// isProjectRoot 判断是否为项目根目录
func (c *ConfigFunction) isProjectRoot(dir string) bool {
	// 检查是否存在项目标识文件
	projectFiles := []string{"config.json", "go.mod", "docker-compose.yml", "README.md"}

	for _, file := range projectFiles {
		if _, err := os.Stat(filepath.Join(dir, file)); err == nil {
			return true
		}
	}

	return false
}

// GenerateConfig 手动生成配置文件
func (c *ConfigFunction) GenerateConfig(configPath string) error {
	projectRoot := c.findProjectRoot()
	globalConfigPath := filepath.Join(projectRoot, "config.json")

	generator := NewConfigGenerator(globalConfigPath, configPath)
	return generator.GenerateConfigIfNotExists()
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

func (c *ConfigFunction) GetApiDocsConfig() (bool, string, string, string, string, string) {
	if IsZero(c.Config) {
		fmt.Println("config 未被赋值")
		return false, "", "", "", "", ""
	}
	return c.Config.ApiDocs.Enabled,
		c.Config.ApiDocs.Title,
		c.Config.ApiDocs.Description,
		c.Config.ApiDocs.Version,
		c.Config.ApiDocs.Contact.Name,
		c.Config.ApiDocs.Contact.Email
}

func (c *ConfigFunction) IsApiDocsEnabled() bool {
	if IsZero(c.Config) {
		return false
	}
	return c.Config.ApiDocs.Enabled
}
