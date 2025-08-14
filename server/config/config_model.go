package config

type Config struct {
	FrontendPrefix []string `json:"frontend-prefix"`
	ServerPort     string   `json:"server-port"`
	ApiDocs        struct {
		Enabled     bool   `json:"enabled"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Version     string `json:"version"`
		Contact     struct {
			Name  string `json:"name"`
			Email string `json:"email"`
		} `json:"contact"`
	} `json:"api-docs"`
	Database struct {
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
	} `json:"redis"`
	Storage struct {
		Type string `json:"type"` // "local", "tencent-cos", "aliyun-oss"
		Local struct {
			Path string `json:"path"`
		} `json:"local"`
		TencentCOS struct {
			SecretID  string `json:"secret-id"`
			SecretKey string `json:"secret-key"`
			BucketURL string `json:"bucket-url"`
			Region    string `json:"region"`
		} `json:"tencent-cos"`
		AliyunOSS struct {
			AccessKeyID     string `json:"access-key-id"`
			AccessKeySecret string `json:"access-key-secret"`
			Endpoint        string `json:"endpoint"`
			BucketName      string `json:"bucket-name"`
		} `json:"aliyun-oss"`
	} `json:"storage"`
}