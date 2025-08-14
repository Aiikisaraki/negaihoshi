package service

import (
	"crypto/md5"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
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
	// 创建上传目录
	uploadDir := s.config.Storage.Local.Path
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("创建上传目录失败: %v", err)
	}

	// 生成唯一文件名
	timestamp := time.Now().Unix()
	_ = fmt.Sprintf("avatar_%d_%d.jpg", userID, timestamp)
	filePath := filepath.Join(uploadDir, fmt.Sprintf("avatar_%d_%d.jpg", userID, timestamp))

	// 创建文件
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("创建文件失败: %v", err)
	}
	defer dst.Close()

	// 复制文件内容
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("保存文件失败: %v", err)
	}

	// 返回相对路径URL
	return fmt.Sprintf("/uploads/avatars/%s", fmt.Sprintf("avatar_%d_%d.jpg", userID, timestamp)), nil
}

func (s *LocalAvatarStorage) DeleteAvatar(avatarPath string) error {
	if avatarPath == "" {
		return nil
	}
	
	// 只删除本地文件（以/uploads/avatars/开头的路径）
	if filepath.HasPrefix(avatarPath, "/uploads/avatars/") {
		fullPath := filepath.Join(s.config.Storage.Local.Path, filepath.Base(avatarPath))
		return os.Remove(fullPath)
	}
	
	return nil
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