package domain

import "time"

type Posts struct {
	Id      int64
	Title   string
	Content string
	UserId  int64
	Ctime   time.Time
}
