package domain

import "time"

type Status struct {
	Id      int64
	Content string
	UserId  int64
	Ctime   time.Time
}
