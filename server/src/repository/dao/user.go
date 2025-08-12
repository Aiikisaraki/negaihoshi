/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 15:07:30
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-04-23 11:11:04
 * @FilePath: \nekaihoshi\server\src\repository\dao\user.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package dao

import (
	"database/sql"
	"errors"
	"time"

	"negaihoshi/server/src/domain"
)

type User struct {
	Id       int64     `gorm:"primaryKey;autoIncrement"`
	Username string    `gorm:"unique;not null"`
	Email    string    `gorm:"unique;not null"`
	Password string    `gorm:"not null"`
	Nickname string    `gorm:"size:100"`
	Bio      string    `gorm:"type:text"`
	Avatar   string    `gorm:"size:500"`
	Phone    string    `gorm:"size:20"`
	Location string    `gorm:"size:200"`
	Website  string    `gorm:"size:500"`
	Ctime    time.Time `gorm:"autoCreateTime"`
	Utime    time.Time `gorm:"autoUpdateTime"`
}

type UserDAO struct {
	db *sql.DB
}

func NewUserDAO(db *sql.DB) *UserDAO {
	return &UserDAO{db: db}
}

func (dao *UserDAO) Insert(user *User) error {
	query := `
		INSERT INTO users (username, email, password, nickname, bio, avatar, phone, location, website, ctime, utime)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	now := time.Now()
	_, err := dao.db.Exec(query,
		user.Username,
		user.Email,
		user.Password,
		user.Nickname,
		user.Bio,
		user.Avatar,
		user.Phone,
		user.Location,
		user.Website,
		now,
		now,
	)

	if err != nil {
		// 检查是否是唯一性约束冲突
		if err.Error() == "UNIQUE constraint failed: users.username" {
			return errors.New("username already exists")
		}
		if err.Error() == "UNIQUE constraint failed: users.email" {
			return errors.New("email already exists")
		}
		return err
	}

	return nil
}

func (dao *UserDAO) FindById(id int64) (*User, error) {
	query := `
		SELECT id, username, email, password, nickname, bio, avatar, phone, location, website, ctime, utime
		FROM users WHERE id = ?
	`

	user := &User{}
	err := dao.db.QueryRow(query, id).Scan(
		&user.Id,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Nickname,
		&user.Bio,
		&user.Avatar,
		&user.Phone,
		&user.Location,
		&user.Website,
		&user.Ctime,
		&user.Utime,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (dao *UserDAO) FindByEmail(email string) (*User, error) {
	query := `
		SELECT id, username, email, password, nickname, bio, avatar, phone, location, website, ctime, utime
		FROM users WHERE email = ?
	`

	user := &User{}
	err := dao.db.QueryRow(query, email).Scan(
		&user.Id,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Nickname,
		&user.Bio,
		&user.Avatar,
		&user.Phone,
		&user.Location,
		&user.Website,
		&user.Ctime,
		&user.Utime,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (dao *UserDAO) FindByUsername(username string) (*User, error) {
	query := `
		SELECT id, username, email, password, nickname, bio, avatar, phone, location, website, ctime, utime
		FROM users WHERE username = ?
	`

	user := &User{}
	err := dao.db.QueryRow(query, username).Scan(
		&user.Id,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Nickname,
		&user.Bio,
		&user.Avatar,
		&user.Phone,
		&user.Location,
		&user.Website,
		&user.Ctime,
		&user.Utime,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (dao *UserDAO) UpdateProfile(id int64, profile *domain.ProfileUpdateRequest) error {
	query := `
		UPDATE users 
		SET nickname = ?, bio = ?, avatar = ?, phone = ?, location = ?, website = ?, utime = ?
		WHERE id = ?
	`

	now := time.Now()
	_, err := dao.db.Exec(query,
		profile.Nickname,
		profile.Bio,
		profile.Avatar,
		profile.Phone,
		profile.Location,
		profile.Website,
		now,
		id,
	)

	return err
}
