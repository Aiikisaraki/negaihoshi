package domain

import "time"

type Like struct {
	Id        int64
	ContentId int64
	IsPost    bool
	UserId    int64
	Ctime     time.Time
}

type Comment struct {
	Id        int64
	ContentId int64
	IsPost    bool
	UserId    int64
	Content   string
	Ctime     time.Time
}

type Follow struct {
	Id         int64
	FollowerId int64
	FolloweeId int64
	Ctime      time.Time
}
