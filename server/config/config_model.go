package config

// Config 配置结构体
type Config struct {
	FrontendPrefix []string `json:"frontend-prefix"`
	ServerPort     string   `json:"server-port"`
	ServerDomain   string   `json:"server-domain"`
	CORS           CORSConfig `json:"cors"`
	IPDetection    IPDetectionConfig `json:"ip_detection"`
	Database       DatabaseConfig `json:"database"`
	Redis          RedisConfig `json:"redis"`
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
