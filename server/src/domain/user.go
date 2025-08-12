package domain

import "time"

type User struct {
	Id       int64
	Username string
	Email    string
	Password string
	Nickname string
	Bio      string
	Avatar   string
	Phone    string
	Location string
	Website  string
	Ctime    time.Time
	Utime    time.Time
}

// 个人资料更新请求
type ProfileUpdateRequest struct {
	Nickname string `json:"nickname"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
	Phone    string `json:"phone"`
	Location string `json:"location"`
	Website  string `json:"website"`
}

// 个人资料响应
type ProfileResponse struct {
	Id       int64  `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
	Phone    string `json:"phone"`
	Location string `json:"location"`
	Website  string `json:"website"`
	Ctime    string `json:"ctime"`
	Utime    string `json:"utime"`
}
