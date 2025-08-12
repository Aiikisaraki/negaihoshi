/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-24 11:56:44
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-04-24 12:02:27
 * @FilePath: \nekaihoshi\server\src\util\bath_auth.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package util

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

type BasicAuth struct{}

func (bathAuth *BasicAuth) EncodeBasicAuthString(username string, password string) string {
	encodeString := base64.StdEncoding.EncodeToString([]byte(username + ":" + password))
	return "Basic " + encodeString
}

// func (bathAuth *BasicAuth) DecodeBasicAuthString(authString string) (string, string) {
// 	decodeString, _ := base64.StdEncoding.DecodeString(authString[6:])
// 	username := string(decodeString[:strings.Index(string(decodeString), ":")])
// 	password := string(decodeString[strings.Index(string(decodeString), ":")+1:])
// 	password := string(decodeString[strings.Index(string(decodeString), ":")+1:])
// 	return username, password
// }

// PasswordCrypto 密码加密工具
type PasswordCrypto struct {
	key []byte
}

// NewPasswordCrypto 创建新的密码加密工具
func NewPasswordCrypto(key []byte) *PasswordCrypto {
	// 确保密钥长度为32字节（AES-256）
	if len(key) < 32 {
		// 如果密钥不足32字节，用0填充
		paddedKey := make([]byte, 32)
		copy(paddedKey, key)
		return &PasswordCrypto{key: paddedKey}
	}
	// 如果密钥超过32字节，截取前32字节
	return &PasswordCrypto{key: key[:32]}
}

// EncryptPassword 加密密码
func (pc *PasswordCrypto) EncryptPassword(password string) (string, error) {
	// 生成随机nonce，GCM模式要求12字节
	nonce := make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// 创建AES cipher
	block, err := aes.NewCipher(pc.key)
	if err != nil {
		return "", err
	}

	// 创建GCM模式
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// 加密密码
	ciphertext := gcm.Seal(nil, nonce, []byte(password), nil)

	// 将nonce和密文组合并base64编码
	result := make([]byte, 0, len(nonce)+len(ciphertext))
	result = append(result, nonce...)
	result = append(result, ciphertext...)

	return base64.StdEncoding.EncodeToString(result), nil
}

// DecryptPassword 解密密码
func (pc *PasswordCrypto) DecryptPassword(encryptedPassword string) (string, error) {
	// base64解码
	data, err := base64.StdEncoding.DecodeString(encryptedPassword)
	if err != nil {
		return "", err
	}

	// 检查数据长度，GCM模式使用12字节nonce
	if len(data) < 12 {
		return "", errors.New("加密数据长度不足")
	}

	// 提取nonce和密文
	nonce := data[:12]
	ciphertext := data[12:]

	// 创建AES cipher
	block, err := aes.NewCipher(pc.key)
	if err != nil {
		return "", err
	}

	// 创建GCM模式
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// 解密密码
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// VerifyPassword 验证密码
func (pc *PasswordCrypto) VerifyPassword(plainPassword, encryptedPassword string) bool {
	decrypted, err := pc.DecryptPassword(encryptedPassword)
	if err != nil {
		return false
	}
	return plainPassword == decrypted
}
