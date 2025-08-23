package config

// Config 配置结构体
type Config struct {
	FrontendPrefix []string `json:"frontend-prefix"`
	ServerPort     string   `json:"server-port"`
	ServerDomain   string   `json:"server-domain"`
	CORS           CORSConfig `json:"cors"`
	IPDetection    IPDetectionConfig `json:"ip_detection"`
	Guest          GuestConfig `json:"guest"`
	ApiDocs        ApiDocsConfig `json:"api-docs"`
	Database       DatabaseConfig `json:"database"`
	Redis          RedisConfig `json:"redis"`
	Storage        StorageConfig `json:"storage"`
}

// CORSConfig CORS配置
type CORSConfig struct {
	Enabled         bool `json:"enabled"`
	AllowCredentials bool `json:"allow_credentials"`
	MaxAge          int  `json:"max_age"`
}

// IPDetectionConfig IP检测配置
type IPDetectionConfig struct {
	Enabled                    bool     `json:"enabled"`
	TrustedProxies            []string `json:"trusted_proxies"`
	TrustXRealIP              bool     `json:"trust_x_real_ip"`
	TrustXForwardedFor        bool     `json:"trust_x_forwarded_for"`
	TrustCFConnectingIP       bool     `json:"trust_cf_connecting_ip"`
	TrustLastXForwardedFor    bool     `json:"trust_last_x_forwarded_for"`
	LogIPInfo                 bool     `json:"log_ip_info"`
}

// GuestConfig 访客配置
type GuestConfig struct {
	DailyTreeholeLimit int `json:"daily-treehole-limit"`
}

// ApiDocsConfig API文档配置
type ApiDocsConfig struct {
	Enabled     bool   `json:"enabled"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Version     string `json:"version"`
	Contact     ContactConfig `json:"contact"`
}

// ContactConfig 联系信息配置
type ContactConfig struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Type         string `json:"type"`
	Host         string `json:"host"`
	Port         string `json:"port"`
	User         string `json:"user"`
	Password     string `json:"password"`
	DatabaseName string `json:"database-name"`
}

// RedisConfig Redis配置
type RedisConfig struct {
	Host     string `json:"host"`
	Port     string `json:"port"`
	Password string `json:"password"`
}

// StorageConfig 存储配置
type StorageConfig struct {
	Type  string `json:"type"` // "local", "tencent-cos", "aliyun-oss"
	Local LocalStorageConfig `json:"local"`
	TencentCOS TencentCOSConfig `json:"tencent-cos"`
	AliyunOSS AliyunOSSConfig `json:"aliyun-oss"`
}

// LocalStorageConfig 本地存储配置
type LocalStorageConfig struct {
	Path string `json:"path"`
}

// TencentCOSConfig 腾讯云COS配置
type TencentCOSConfig struct {
	SecretID  string `json:"secret-id"`
	SecretKey string `json:"secret-key"`
	BucketURL string `json:"bucket-url"`
	Region    string `json:"region"`
}

// AliyunOSSConfig 阿里云OSS配置
type AliyunOSSConfig struct {
	AccessKeyID     string `json:"access-key-id"`
	AccessKeySecret string `json:"access-key-secret"`
	Endpoint        string `json:"endpoint"`
	BucketName      string `json:"bucket-name"`
}
