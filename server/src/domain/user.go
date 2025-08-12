package domain

import "time"

type User struct {
	Id       int64
	Username string
	Email    string
	Password string
	Ctime    time.Time
}
