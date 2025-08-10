#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置文件和目录
CONFIG_FILE="config.json"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# 检查配置文件是否存在，如果不存在则提示用户
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}警告: 配置文件 $CONFIG_FILE 不存在${NC}"
    echo -e "${BLUE}系统将尝试自动生成配置文件...${NC}"
    
    # 检查后端配置生成工具是否存在
    if [ -f "server/cmd/config-generator/main.go" ]; then
        echo -e "${BLUE}正在生成配置文件...${NC}"
        cd server
        go run cmd/config-generator/main.go
        cd ..
        
        if [ ! -f "$CONFIG_FILE" ]; then
            echo -e "${RED}配置文件生成失败，请手动创建配置文件${NC}"
            exit 1
        fi
    else
        echo -e "${RED}配置文件生成工具不存在，请手动创建配置文件${NC}"
        exit 1
    fi
fi

# 检查docker-compose文件是否存在
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    echo -e "${RED}错误: Docker Compose文件 $DOCKER_COMPOSE_FILE 不存在${NC}"
    exit 1
fi

# 读取配置
get_config_value() {
    local key=$1
    local value=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('$key', ''))" 2>/dev/null)
    echo $value
}

# 检查Docker是否运行
check_docker() {
    echo -e "${BLUE}检查Docker环境...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker未安装${NC}"
        exit 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}错误: Docker未运行，请先启动Docker${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}错误: docker-compose未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Docker环境检查通过${NC}"
}

# 构建镜像
build_images() {
    echo -e "${BLUE}构建Docker镜像...${NC}"
    
    # 构建后端镜像
    echo -e "${BLUE}构建后端镜像...${NC}"
    docker build -t negaihoshi-backend ./server
    
    # 构建主前端镜像
    echo -e "${BLUE}构建主前端镜像...${NC}"
    docker build -t negaihoshi-frontend-main ./frontend/aii-home
    
    # 检查是否启用管理员前端
    local admin_enabled=$(get_config_value "frontend.admin.enabled")
    if [ "$admin_enabled" = "True" ]; then
        echo -e "${BLUE}构建管理员前端镜像...${NC}"
        docker build -t negaihoshi-frontend-admin ./frontend/admin
    fi
    
    echo -e "${GREEN}镜像构建完成${NC}"
}

# 启动基础服务
start_base_services() {
    echo -e "${BLUE}启动基础服务 (MySQL, Redis)...${NC}"
    
    docker-compose up -d mysql redis
    
    echo -e "${BLUE}等待数据库服务启动...${NC}"
    sleep 30
    
    # 检查数据库连接
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec mysql mysqladmin ping -h localhost --silent; then
            echo -e "${GREEN}数据库服务已就绪${NC}"
            break
        fi
        
        echo -e "${YELLOW}等待数据库服务... (尝试 $attempt/$max_attempts)${NC}"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}数据库服务启动超时${NC}"
        exit 1
    fi
}

# 启动后端服务
start_backend() {
    echo -e "${BLUE}启动后端服务...${NC}"
    
    docker-compose up -d backend
    
    echo -e "${BLUE}等待后端服务启动...${NC}"
    sleep 20
    
    # 检查后端服务
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:9292/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}后端服务已就绪${NC}"
            break
        fi
        
        echo -e "${YELLOW}等待后端服务... (尝试 $attempt/$max_attempts)${NC}"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}后端服务启动超时${NC}"
        exit 1
    fi
}

# 启动前端服务
start_frontend_services() {
    echo -e "${BLUE}启动前端服务...${NC}"
    
    # 启动主前端
    docker-compose up -d frontend-main
    
    # 检查是否启用管理员前端
    local admin_enabled=$(get_config_value "frontend.admin.enabled")
    if [ "$admin_enabled" = "True" ]; then
        echo -e "${BLUE}启动管理员前端服务...${NC}"
        docker-compose --profile admin up -d frontend-admin
    fi
    
    echo -e "${BLUE}等待前端服务启动...${NC}"
    sleep 15
}

# 启动Nginx代理 (可选)
start_nginx() {
    local use_nginx=${1:-false}
    
    if [ "$use_nginx" = "true" ]; then
        echo -e "${BLUE}启动Nginx反向代理...${NC}"
        docker-compose --profile nginx up -d nginx
        sleep 5
    fi
}

# 显示服务状态
show_status() {
    echo -e "${BLUE}服务状态:${NC}"
    docker-compose ps
    
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "  主前端: http://localhost:3000"
    
    local admin_enabled=$(get_config_value "frontend.admin.enabled")
    if [ "$admin_enabled" = "True" ]; then
        echo -e "  管理员前端: http://localhost:3001"
    fi
    
    echo -e "  后端API: http://localhost:9292"
    echo -e "  API文档: http://localhost:9292/api/docs"
    echo -e "  MySQL: localhost:3306"
    echo -e "  Redis: localhost:6379"
}

# 停止所有服务
stop_all() {
    echo -e "${BLUE}停止所有服务...${NC}"
    docker-compose down
    echo -e "${GREEN}所有服务已停止${NC}"
}

# 重启所有服务
restart_all() {
    echo -e "${BLUE}重启所有服务...${NC}"
    stop_all
    sleep 5
    start_all
}

# 查看日志
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        echo -e "${BLUE}显示所有服务日志:${NC}"
        docker-compose logs -f
    else
        echo -e "${BLUE}显示 $service 服务日志:${NC}"
        docker-compose logs -f $service
    fi
}

# 清理资源
cleanup() {
    echo -e "${BLUE}清理Docker资源...${NC}"
    
    # 停止并删除容器
    docker-compose down
    
    # 删除镜像
    docker rmi negaihoshi-backend negaihoshi-frontend-main negaihoshi-frontend-admin 2>/dev/null || true
    
    # 删除卷
    docker volume rm negaihoshi_mysql_data negaihoshi_redis_data 2>/dev/null || true
    
    echo -e "${GREEN}清理完成${NC}"
}

# 启动所有服务
start_all() {
    echo -e "${BLUE}启动 Negaihoshi 系统 (Docker)...${NC}"
    
    check_docker
    build_images
    start_base_services
    start_backend
    start_frontend_services
    
    show_status
    
    echo -e "${GREEN}所有服务启动完成!${NC}"
    echo -e "${BLUE}管理命令:${NC}"
    echo -e "  查看日志: $0 logs [service]"
    echo -e "  停止服务: $0 stop"
    echo -e "  重启服务: $0 restart"
    echo -e "  清理资源: $0 cleanup"
}

# 主函数
main() {
    case "${1:-start}" in
        "start")
            start_all
            ;;
        "stop")
            stop_all
            ;;
        "restart")
            restart_all
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "build")
            check_docker
            build_images
            ;;
        "backend")
            check_docker
            start_base_services
            start_backend
            ;;
        "frontend")
            check_docker
            start_frontend_services
            ;;
        *)
            echo -e "${YELLOW}用法: $0 [start|stop|restart|status|logs|cleanup|build|backend|frontend]${NC}"
            echo -e "${BLUE}命令说明:${NC}"
            echo -e "  start    - 启动所有服务"
            echo -e "  stop     - 停止所有服务"
            echo -e "  restart  - 重启所有服务"
            echo -e "  status   - 显示服务状态"
            echo -e "  logs     - 查看服务日志 (可选: 指定服务名)"
            echo -e "  cleanup  - 清理Docker资源"
            echo -e "  build    - 构建Docker镜像"
            echo -e "  backend  - 仅启动后端服务"
            echo -e "  frontend - 仅启动前端服务"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
