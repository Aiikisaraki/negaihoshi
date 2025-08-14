package web

import (
	"negaihoshi/server/config"
	"negaihoshi/server/src/repository"
	"negaihoshi/server/src/repository/dao"
	"negaihoshi/server/src/service"
	"negaihoshi/server/src/util"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func InitWebServer(config *config.Config) *gin.Engine {
	// 初始化数据库连接
	db := initDB(config)
	
	// 获取底层的sql.DB
	sqlDB, err := db.DB()
	if err != nil {
		panic(err)
	}
	
	// 初始化DAO
	userDAO := dao.NewUserDAO(sqlDB)
	
	// 初始化Repository
	userRepo := repository.NewUserRepository(userDAO)
	
	// 初始化工具类
	passwordCrypto := util.NewPasswordCrypto([]byte("negaihoshi-password-encryption-key-32bytes"))
	
	// 初始化存储服务
	avatarStorage := service.NewAvatarStorage(config)
	
	// 初始化Service
	userService := service.NewUserService(userRepo, passwordCrypto, avatarStorage)
	
	// 初始化Handler
	userHandler := NewUserHandler(userService, avatarStorage)
	
	// 创建Gin引擎
	server := gin.Default()
	
	// 添加静态文件服务，用于访问上传的头像
	server.Static("/uploads", "./uploads")
	
	// 注册路由
	userHandler.RegisterUserRoutes(server)
	
	return server
}

func initDB(config *config.Config) *gorm.DB {
	dbHost := config.Database.Host
	dbPort := config.Database.Port
	dbUser := config.Database.User
	dbPassword := config.Database.Password
	dbDatabaseName := config.Database.DatabaseName
	
	dsn := dbUser + ":" + dbPassword + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbDatabaseName + "?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	// 初始化用户表（包含新的个人资料字段）
	err = dao.InitUserTable(db)
	if err != nil {
		panic(err)
	}

	// 初始化其他表
	err = dao.InitUserWordpressInfoTable(db)
	if err != nil {
		panic(err)
	}
	err = dao.InitTreeHoleTable(db)
	if err != nil {
		panic(err)
	}
	
	err = dao.InitStatusTable(db)
	if err != nil {
		panic(err)
	}
	
	err = dao.InitPostsTable(db)
	if err != nil {
		panic(err)
	}

	return db
}