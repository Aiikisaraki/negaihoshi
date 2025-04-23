package domain

import "time"

type UserWordpressInfo struct {
	Id    int64
	Uid   int64
	WPuid int64
	Ctime time.Time
}
