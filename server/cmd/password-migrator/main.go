/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-20 10:00:00
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-01-20 10:00:00
 * @FilePath: \negaihoshi\server\cmd\password-migrator\main.go
 * @Description: 密码加密迁移工具
 */
package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"negaihoshi/server/src/util"

	_ "github.com/go-sql-driver/mysql"
)

type User struct {
	ID       int64
	Username string
	Password string
	Email    string
}

func main() {
	// 数据库连接配置
	dbHost := "localhost"
	dbPort := "3306"
	dbUser := "root"
	dbPassword := "password"
	dbName := "negaihoshi"

	// 从环境变量读取配置
	if host := os.Getenv("DB_HOST"); host != "" {
		dbHost = host
	}
	if port := os.Getenv("DB_PORT"); port != "" {
		dbPort = port
	}
	if user := os.Getenv("DB_USER"); user != "" {
		dbUser = user
	}
	if password := os.Getenv("DB_PASSWORD"); password != "" {
		dbPassword = password
	}
	if name := os.Getenv("DB_NAME"); name != "" {
		dbName = name
	}

	// 连接数据库
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}
	defer db.Close()

	// 测试数据库连接
	if err := db.Ping(); err != nil {
		log.Fatalf("数据库连接测试失败: %v", err)
	}
	fmt.Println("✅ 数据库连接成功")

	// 初始化密码加密工具
	cryptoKey := []byte("negaihoshi-password-encryption-key-32bytes")
	crypto := util.NewPasswordCrypto(cryptoKey)

	// 查询所有用户
	rows, err := db.Query("SELECT id, username, password, email FROM users")
	if err != nil {
		log.Fatalf("查询用户失败: %v", err)
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.Password, &user.Email); err != nil {
			log.Printf("扫描用户数据失败: %v", err)
			continue
		}
		users = append(users, user)
	}

	fmt.Printf("📊 找到 %d 个用户\n", len(users))

	// 开始密码迁移
	successCount := 0
	failCount := 0

	for _, user := range users {
		fmt.Printf("🔄 处理用户: %s (ID: %d)\n", user.Username, user.ID)

		// 检查密码是否已经是加密的（简单判断）
		if len(user.Password) > 50 && len(user.Password) < 200 {
			fmt.Printf("   ⚠️  密码可能已经是加密的，跳过\n")
			continue
		}

		// 加密密码
		encryptedPassword, err := crypto.EncryptPassword(user.Password)
		if err != nil {
			log.Printf("   ❌ 密码加密失败: %v", err)
			failCount++
			continue
		}

		// 更新数据库
		_, err = db.Exec("UPDATE users SET password = ? WHERE id = ?", encryptedPassword, user.ID)
		if err != nil {
			log.Printf("   ❌ 数据库更新失败: %v", err)
			failCount++
			continue
		}

		fmt.Printf("   ✅ 密码加密成功\n")
		successCount++
	}

	// 输出迁移结果
	fmt.Println("\n🎯 密码迁移完成!")
	fmt.Printf("✅ 成功: %d 个用户\n", successCount)
	fmt.Printf("❌ 失败: %d 个用户\n", failCount)
	fmt.Printf("📊 总计: %d 个用户\n", len(users))

	if failCount > 0 {
		fmt.Println("\n⚠️  有部分用户密码迁移失败，请检查日志")
		os.Exit(1)
	}

	fmt.Println("\n🎉 所有用户密码迁移成功!")
}

