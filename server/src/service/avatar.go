package service

import (
	"crypto/md5"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"negaihoshi/server/config"
)

type AvatarStorage interface {
	SaveAvatar(file multipart.File, userID int64) (string, error)
	DeleteAvatar(avatarPath string) error
}

type LocalAvatarStorage struct {
	config *config.Config
}

type TencentCOSAvatarStorage struct {
	config *config.Config
}

type AliyunOSSAvatarStorage struct {
	config *config.Config
}

func NewAvatarStorage(config *config.Config) AvatarStorage {
	switch config.Storage.Type {
	case "tencent-cos":
		return &TencentCOSAvatarStorage{config: config}
	case "aliyun-oss":
		return &AliyunOSSAvatarStorage{config: config}
	default:
		return &LocalAvatarStorage{config: config}
	}
}

func (s *LocalAvatarStorage) SaveAvatar(file multipart.File, userID int64) (string, error) {
	// 创建上传目录（为空提供默认值）
	uploadDir := s.config.Storage.Local.Path
	if strings.TrimSpace(uploadDir) == "" {
		uploadDir = "./uploads/avatars"
	}
	// 针对不同用户使用单独目录
	userDir := filepath.Join(uploadDir, fmt.Sprintf("%d", userID))
	if err := os.MkdirAll(userDir, 0755); err != nil {
		return "", fmt.Errorf("创建上传目录失败: %v", err)
	}

	// 读取上传内容并计算哈希，进行去重
	content, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("读取上传内容失败: %v", err)
	}
	incomingHash := md5.Sum(content)
	incomingHashHex := fmt.Sprintf("%x", incomingHash[:])

	// 遍历用户目录，若已存在相同哈希内容则直接返回现有文件URL
	if url := findExistingAvatarByHash(userDir, incomingHashHex); url != "" {
		return fmt.Sprintf("/uploads/avatars/%d/%s", userID, url), nil
	}

	// 生成唯一文件名
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("avatar_%d_%d.jpg", userID, timestamp)
	filePath := filepath.Join(userDir, filename)

	// 创建文件
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("创建文件失败: %v", err)
	}
	defer dst.Close()

	// 写入文件内容（使用读取到的内存数据）
	if _, err := dst.Write(content); err != nil {
		return "", fmt.Errorf("保存文件失败: %v", err)
	}

	// 清理旧版本，只保留最近3个
	_ = cleanupOldAvatars(userDir, 3)

	// 返回相对路径URL（包含用户目录）
	return fmt.Sprintf("/uploads/avatars/%d/%s", userID, filename), nil
}

func (s *LocalAvatarStorage) DeleteAvatar(avatarPath string) error {
	if avatarPath == "" {
		return nil
	}

	// 只删除本地文件（以/uploads/avatars/开头的路径）
	if strings.HasPrefix(avatarPath, "/uploads/avatars/") {
		baseDir := s.config.Storage.Local.Path
		if strings.TrimSpace(baseDir) == "" {
			baseDir = "./uploads/avatars"
		}
		// 保留子目录结构
		rel := strings.TrimPrefix(avatarPath, "/uploads/avatars/")
		fullPath := filepath.Join(baseDir, rel)
		return os.Remove(fullPath)
	}

	return nil
}

// cleanupOldAvatars 保留目录下最近 keep 个文件，删除其余
func cleanupOldAvatars(dir string, keep int) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	// 收集文件及其修改时间
	type fileInfo struct {
		name    string
		modTime time.Time
	}
	var files []fileInfo
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		// 只考虑常见图片后缀
		ext := strings.ToLower(filepath.Ext(e.Name()))
		if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" {
			files = append(files, fileInfo{name: e.Name(), modTime: info.ModTime()})
		}
	}

	// 按修改时间倒序排序
	sort.Slice(files, func(i, j int) bool { return files[i].modTime.After(files[j].modTime) })

	if len(files) <= keep {
		return nil
	}

	// 删除多余文件
	for _, f := range files[keep:] {
		_ = os.Remove(filepath.Join(dir, f.name))
	}
	return nil
}

// findExistingAvatarByHash 在目录内查找与给定哈希匹配的文件名，匹配则返回文件名，否则返回空串
func findExistingAvatarByHash(dir string, targetHash string) string {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return ""
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		path := filepath.Join(dir, e.Name())
		f, err := os.Open(path)
		if err != nil {
			continue
		}
		h := md5.New()
		_, _ = io.Copy(h, f)
		_ = f.Close()
		hashHex := fmt.Sprintf("%x", h.Sum(nil))
		if strings.EqualFold(hashHex, targetHash) {
			return e.Name()
		}
	}
	return ""
}

func (s *TencentCOSAvatarStorage) SaveAvatar(file multipart.File, userID int64) (string, error) {
	// 实现腾讯云COS存储逻辑
	// 这里应该是调用腾讯云COS SDK上传文件
	// 为简化演示，这里返回模拟URL
	timestamp := time.Now().Unix()
	_ = fmt.Sprintf("avatar_%d_%d.jpg", userID, timestamp)

	// MD5哈希生成唯一标识
	h := md5.New()
	io.WriteString(h, fmt.Sprintf("%d%d", userID, timestamp))
	hash := fmt.Sprintf("%x", h.Sum(nil))

	return fmt.Sprintf("%s/%s/%s.jpg", s.config.Storage.TencentCOS.BucketURL, "avatars", hash), nil
}

func (s *TencentCOSAvatarStorage) DeleteAvatar(avatarPath string) error {
	// 实现腾讯云COS删除逻辑
	// 这里应该是调用腾讯云COS SDK删除文件
	return nil
}

func (s *AliyunOSSAvatarStorage) SaveAvatar(file multipart.File, userID int64) (string, error) {
	// 实现阿里云OSS存储逻辑
	// 这里应该是调用阿里云OSS SDK上传文件
	// 为简化演示，这里返回模拟URL
	timestamp := time.Now().Unix()
	_ = fmt.Sprintf("avatar_%d_%d.jpg", userID, timestamp)

	// MD5哈希生成唯一标识
	h := md5.New()
	io.WriteString(h, fmt.Sprintf("%d%d", userID, timestamp))
	hash := fmt.Sprintf("%x", h.Sum(nil))

	return fmt.Sprintf("https://%s.%s/avatars/%s.jpg",
		s.config.Storage.AliyunOSS.BucketName,
		s.config.Storage.AliyunOSS.Endpoint,
		hash), nil
}

func (s *AliyunOSSAvatarStorage) DeleteAvatar(avatarPath string) error {
	// 实现阿里云OSS删除逻辑
	// 这里应该是调用阿里云OSS SDK删除文件
	return nil
}
