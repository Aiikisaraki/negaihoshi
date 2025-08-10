/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-20 20:00:00
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-01-20 20:00:00
 * @FilePath: \negaihoshi\server\config\config_generator.go
 * @Description: 配置文件生成器，支持从全局配置文件生成后端配置文件
 */
package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// GlobalConfig 全局配置文件结构
type GlobalConfig struct {
	Site struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Version     string `json:"version"`
		Author      string `json:"author"`
		Contact     struct {
			Email   string `json:"email"`
			Website string `json:"website"`
		} `json:"contact"`
	} `json:"site"`
	Server struct {
		Port  int    `json:"port"`
		Host  string `json:"host"`
		Debug bool   `json:"debug"`
		Cors  struct {
			Enabled bool     `json:"enabled"`
			Origins []string `json:"origins"`
		} `json:"cors"`
		Session struct {
			Secret string `json:"secret"`
			MaxAge int    `json:"max_age"`
		} `json:"session"`
	} `json:"server"`
	Database struct {
		Driver       string `json:"driver"`
		Host         string `json:"host"`
		Port         int    `json:"port"`
		Username     string `json:"username"`
		Password     string `json:"password"`
		Database     string `json:"database"`
		Charset      string `json:"charset"`
		MaxIdleConns int    `json:"max_idle_conns"`
		MaxOpenConns int    `json:"max_open_conns"`
	} `json:"database"`
	Redis struct {
		Host     string `json:"host"`
		Port     int    `json:"port"`
		Password string `json:"password"`
		Database int    `json:"database"`
		PoolSize int    `json:"pool_size"`
	} `json:"redis"`
	Frontend struct {
		Main struct {
			Enabled  bool   `json:"enabled"`
			Port     int    `json:"port"`
			BuildDir string `json:"build_dir"`
		} `json:"main"`
		Admin struct {
			Enabled  bool   `json:"enabled"`
			Port     int    `json:"port"`
			BuildDir string `json:"build_dir"`
		} `json:"admin"`
	} `json:"frontend"`
	Features struct {
		UserRegistration     bool `json:"user_registration"`
		ContentReview        bool `json:"content_review"`
		ApiDocs              bool `json:"api_docs"`
		AdminPanel           bool `json:"admin_panel"`
		WordpressIntegration bool `json:"wordpress_integration"`
	} `json:"features"`
	Limits struct {
		MaxPostLength     int `json:"max_post_length"`
		MaxUsernameLength int `json:"max_username_length"`
		MaxEmailLength    int `json:"max_email_length"`
		RateLimit         struct {
			RequestsPerMinute int `json:"requests_per_minute"`
			Burst             int `json:"burst"`
		} `json:"rate_limit"`
	} `json:"limits"`
	Logging struct {
		Level      string `json:"level"`
		File       string `json:"file"`
		MaxSize    int    `json:"max_size"`
		MaxBackups int    `json:"max_backups"`
		MaxAge     int    `json:"max_age"`
	} `json:"logging"`
	Security struct {
		PasswordMinLength   int    `json:"password_min_length"`
		RequireSpecialChars bool   `json:"require_special_chars"`
		JwtSecret           string `json:"jwt_secret"`
		BcryptCost          int    `json:"bcrypt_cost"`
	} `json:"security"`
}

// ConfigGenerator 配置文件生成器
type ConfigGenerator struct {
	globalConfigPath  string
	backendConfigPath string
}

// NewConfigGenerator 创建新的配置生成器
func NewConfigGenerator(globalConfigPath, backendConfigPath string) *ConfigGenerator {
	return &ConfigGenerator{
		globalConfigPath:  globalConfigPath,
		backendConfigPath: backendConfigPath,
	}
}

// GenerateConfig 生成后端配置文件
func (cg *ConfigGenerator) GenerateConfig() error {
	// 检查全局配置文件是否存在
	if _, err := os.Stat(cg.globalConfigPath); os.IsNotExist(err) {
		return fmt.Errorf("全局配置文件不存在: %s", cg.globalConfigPath)
	}

	// 读取全局配置文件
	globalConfig, err := cg.readGlobalConfig()
	if err != nil {
		return fmt.Errorf("读取全局配置文件失败: %v", err)
	}

	// 生成后端配置
	backendConfig := cg.convertToBackendConfig(globalConfig)

	// 确保配置目录存在
	configDir := filepath.Dir(cg.backendConfigPath)
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("创建配置目录失败: %v", err)
	}

	// 写入后端配置文件
	if err := cg.writeBackendConfig(backendConfig); err != nil {
		return fmt.Errorf("写入后端配置文件失败: %v", err)
	}

	fmt.Printf("后端配置文件已生成: %s\n", cg.backendConfigPath)
	return nil
}

// readGlobalConfig 读取全局配置文件
func (cg *ConfigGenerator) readGlobalConfig() (*GlobalConfig, error) {
	data, err := os.ReadFile(cg.globalConfigPath)
	if err != nil {
		return nil, err
	}

	var config GlobalConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

// convertToBackendConfig 将全局配置转换为后端配置
func (cg *ConfigGenerator) convertToBackendConfig(global *GlobalConfig) *Config {
	backend := &Config{}

	// 转换前端前缀
	backend.FrontendPrefix = []string{}
	if global.Frontend.Main.Enabled {
		backend.FrontendPrefix = append(backend.FrontendPrefix,
			fmt.Sprintf("http://localhost:%d", global.Frontend.Main.Port))
	}
	if global.Frontend.Admin.Enabled {
		backend.FrontendPrefix = append(backend.FrontendPrefix,
			fmt.Sprintf("http://localhost:%d", global.Frontend.Admin.Port))
	}

	// 转换服务器端口
	backend.ServerPort = fmt.Sprintf("%d", global.Server.Port)

	// 转换API文档配置
	backend.ApiDocs.Enabled = global.Features.ApiDocs
	backend.ApiDocs.Title = fmt.Sprintf("%s API Documentation", global.Site.Name)
	backend.ApiDocs.Description = global.Site.Description
	backend.ApiDocs.Version = global.Site.Version
	backend.ApiDocs.Contact.Name = global.Site.Author
	backend.ApiDocs.Contact.Email = global.Site.Contact.Email

	// 转换数据库配置
	backend.Database.Type = global.Database.Driver
	backend.Database.Host = global.Database.Host
	backend.Database.Port = fmt.Sprintf("%d", global.Database.Port)
	backend.Database.User = global.Database.Username
	backend.Database.Password = global.Database.Password
	backend.Database.DatabaseName = global.Database.Database

	// 转换Redis配置
	backend.Redis.Host = global.Redis.Host
	backend.Redis.Port = fmt.Sprintf("%d", global.Redis.Port)
	backend.Redis.Password = global.Redis.Password

	return backend
}

// writeBackendConfig 写入后端配置文件
func (cg *ConfigGenerator) writeBackendConfig(config *Config) error {
	data, err := json.MarshalIndent(config, "", "    ")
	if err != nil {
		return err
	}

	return os.WriteFile(cg.backendConfigPath, data, 0644)
}

// GenerateConfigIfNotExists 如果配置文件不存在则生成
func (cg *ConfigGenerator) GenerateConfigIfNotExists() error {
	// 检查后端配置文件是否已存在
	if _, err := os.Stat(cg.backendConfigPath); err == nil {
		fmt.Printf("后端配置文件已存在: %s\n", cg.backendConfigPath)
		return nil
	}

	// 检查全局配置文件是否存在
	if _, err := os.Stat(cg.globalConfigPath); os.IsNotExist(err) {
		// 如果全局配置文件也不存在，生成默认配置
		return cg.generateDefaultConfig()
	}

	// 从全局配置文件生成后端配置
	return cg.GenerateConfig()
}

// generateDefaultConfig 生成默认配置
func (cg *ConfigGenerator) generateDefaultConfig() error {
	fmt.Println("未找到配置文件，生成默认配置...")

	// 创建默认的全局配置文件
	defaultGlobalConfig := &GlobalConfig{}

	// 设置默认值
	defaultGlobalConfig.Site.Name = "树洞系统"
	defaultGlobalConfig.Site.Description = "一个匿名分享心情的平台"
	defaultGlobalConfig.Site.Version = "1.0.0"
	defaultGlobalConfig.Site.Author = "Negaihoshi Team"
	defaultGlobalConfig.Site.Contact.Email = "admin@negaihoshi.com"
	defaultGlobalConfig.Site.Contact.Website = "https://negaihoshi.com"

	defaultGlobalConfig.Server.Port = 9292
	defaultGlobalConfig.Server.Host = "0.0.0.0"
	defaultGlobalConfig.Server.Debug = false
	defaultGlobalConfig.Server.Cors.Enabled = true
	defaultGlobalConfig.Server.Cors.Origins = []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"}
	defaultGlobalConfig.Server.Session.Secret = "your-session-secret-key"
	defaultGlobalConfig.Server.Session.MaxAge = 86400

	defaultGlobalConfig.Database.Driver = "mysql"
	defaultGlobalConfig.Database.Host = "localhost"
	defaultGlobalConfig.Database.Port = 3306
	defaultGlobalConfig.Database.Username = "root"
	defaultGlobalConfig.Database.Password = "password"
	defaultGlobalConfig.Database.Database = "negaihoshi"
	defaultGlobalConfig.Database.Charset = "utf8mb4"
	defaultGlobalConfig.Database.MaxIdleConns = 10
	defaultGlobalConfig.Database.MaxOpenConns = 100

	defaultGlobalConfig.Redis.Host = "localhost"
	defaultGlobalConfig.Redis.Port = 6379
	defaultGlobalConfig.Redis.Password = ""
	defaultGlobalConfig.Redis.Database = 0
	defaultGlobalConfig.Redis.PoolSize = 10

	defaultGlobalConfig.Frontend.Main.Enabled = true
	defaultGlobalConfig.Frontend.Main.Port = 3000
	defaultGlobalConfig.Frontend.Main.BuildDir = "frontend/aii-home/dist"
	defaultGlobalConfig.Frontend.Admin.Enabled = true
	defaultGlobalConfig.Frontend.Admin.Port = 3001
	defaultGlobalConfig.Frontend.Admin.BuildDir = "frontend/admin/dist"

	defaultGlobalConfig.Features.UserRegistration = true
	defaultGlobalConfig.Features.ContentReview = false
	defaultGlobalConfig.Features.ApiDocs = true
	defaultGlobalConfig.Features.AdminPanel = true
	defaultGlobalConfig.Features.WordpressIntegration = true

	defaultGlobalConfig.Limits.MaxPostLength = 1000
	defaultGlobalConfig.Limits.MaxUsernameLength = 50
	defaultGlobalConfig.Limits.MaxEmailLength = 100
	defaultGlobalConfig.Limits.RateLimit.RequestsPerMinute = 60
	defaultGlobalConfig.Limits.RateLimit.Burst = 10

	defaultGlobalConfig.Logging.Level = "info"
	defaultGlobalConfig.Logging.File = "logs/app.log"
	defaultGlobalConfig.Logging.MaxSize = 100
	defaultGlobalConfig.Logging.MaxBackups = 3
	defaultGlobalConfig.Logging.MaxAge = 28

	defaultGlobalConfig.Security.PasswordMinLength = 8
	defaultGlobalConfig.Security.RequireSpecialChars = true
	defaultGlobalConfig.Security.JwtSecret = "your-jwt-secret-key"
	defaultGlobalConfig.Security.BcryptCost = 12

	// 确保全局配置文件目录存在
	globalConfigDir := filepath.Dir(cg.globalConfigPath)
	if err := os.MkdirAll(globalConfigDir, 0755); err != nil {
		return fmt.Errorf("创建全局配置目录失败: %v", err)
	}

	// 写入全局配置文件
	globalData, err := json.MarshalIndent(defaultGlobalConfig, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化全局配置失败: %v", err)
	}

	if err := os.WriteFile(cg.globalConfigPath, globalData, 0644); err != nil {
		return fmt.Errorf("写入全局配置文件失败: %v", err)
	}

	fmt.Printf("全局配置文件已生成: %s\n", cg.globalConfigPath)

	// 生成后端配置文件
	return cg.GenerateConfig()
}
