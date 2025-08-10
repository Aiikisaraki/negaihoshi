#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置文件和日志目录
CONFIG_FILE="config.json"
LOG_DIR="logs"
PID_DIR="pids"

# 创建必要的目录
mkdir -p $LOG_DIR $PID_DIR

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

# 读取配置
get_config_value() {
    local key=$1
    local value=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('$key', ''))" 2>/dev/null)
    echo $value
}

# 检查服务是否运行
is_service_running() {
    local pid_file=$1
    if [ -f "$pid_file" ]; then
        local pid=$(cat $pid_file)
        if ps -p $pid > /dev/null 2>&1; then
            return 0
        else
            rm -f $pid_file
        fi
    fi
    return 1
}

# 启动后端服务
start_backend() {
    echo -e "${BLUE}启动后端服务...${NC}"
    
    if is_service_running "$PID_DIR/backend.pid"; then
        echo -e "${YELLOW}后端服务已在运行${NC}"
        return
    fi
    
    cd server
    nohup go run main.go > ../$LOG_DIR/backend.log 2>&1 &
    echo $! > ../$PID_DIR/backend.pid
    cd ..
    
    echo -e "${GREEN}后端服务已启动 (PID: $(cat $PID_DIR/backend.pid))${NC}"
}

# 启动主前端
start_main_frontend() {
    local enabled=$(get_config_value "frontend.main.enabled")
    if [ "$enabled" != "True" ]; then
        echo -e "${YELLOW}主前端服务已禁用${NC}"
        return
    fi
    
    echo -e "${BLUE}启动主前端服务...${NC}"
    
    if is_service_running "$PID_DIR/main_frontend.pid"; then
        echo -e "${YELLOW}主前端服务已在运行${NC}"
        return
    fi
    
    cd frontend/aii-home
    nohup npm run dev > ../../$LOG_DIR/main_frontend.log 2>&1 &
    echo $! > ../../$PID_DIR/main_frontend.pid
    cd ../..
    
    echo -e "${GREEN}主前端服务已启动 (PID: $(cat $PID_DIR/main_frontend.pid))${NC}"
}

# 启动管理员前端
start_admin_frontend() {
    local enabled=$(get_config_value "frontend.admin.enabled")
    if [ "$enabled" != "True" ]; then
        echo -e "${YELLOW}管理员前端服务已禁用${NC}"
        return
    fi
    
    echo -e "${BLUE}启动管理员前端服务...${NC}"
    
    if is_service_running "$PID_DIR/admin_frontend.pid"; then
        echo -e "${YELLOW}管理员前端服务已在运行${NC}"
        return
    fi
    
    cd frontend/admin
    nohup npm run dev > ../../$LOG_DIR/admin_frontend.log 2>&1 &
    echo $! > ../../$PID_DIR/admin_frontend.pid
    cd ../..
    
    echo -e "${GREEN}管理员前端服务已启动 (PID: $(cat $PID_DIR/admin_frontend.pid))${NC}"
}

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}检查依赖...${NC}"
    
    # 检查Go
    if ! command -v go &> /dev/null; then
        echo -e "${RED}错误: Go未安装${NC}"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: Node.js未安装${NC}"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}错误: npm未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}依赖检查通过${NC}"
}

# 安装前端依赖
install_frontend_deps() {
    echo -e "${BLUE}安装前端依赖...${NC}"
    
    # 安装主前端依赖
    if [ -d "frontend/aii-home" ]; then
        echo -e "${BLUE}安装主前端依赖...${NC}"
        cd frontend/aii-home
        npm install
        cd ../..
    fi
    
    # 安装管理员前端依赖
    if [ -d "frontend/admin" ]; then
        echo -e "${BLUE}安装管理员前端依赖...${NC}"
        cd frontend/admin
        npm install
        cd ../..
    fi
}

# 显示服务状态
show_status() {
    echo -e "${BLUE}服务状态:${NC}"
    
    if is_service_running "$PID_DIR/backend.pid"; then
        echo -e "${GREEN}✓ 后端服务运行中 (PID: $(cat $PID_DIR/backend.pid))${NC}"
    else
        echo -e "${RED}✗ 后端服务未运行${NC}"
    fi
    
    if is_service_running "$PID_DIR/main_frontend.pid"; then
        echo -e "${GREEN}✓ 主前端服务运行中 (PID: $(cat $PID_DIR/main_frontend.pid))${NC}"
    else
        echo -e "${RED}✗ 主前端服务未运行${NC}"
    fi
    
    if is_service_running "$PID_DIR/admin_frontend.pid"; then
        echo -e "${GREEN}✓ 管理员前端服务运行中 (PID: $(cat $PID_DIR/admin_frontend.pid))${NC}"
    else
        echo -e "${RED}✗ 管理员前端服务未运行${NC}"
    fi
}

# 停止所有服务
stop_all() {
    echo -e "${BLUE}停止所有服务...${NC}"
    
    for pid_file in $PID_DIR/*.pid; do
        if [ -f "$pid_file" ]; then
            local pid=$(cat $pid_file)
            if ps -p $pid > /dev/null 2>&1; then
                kill $pid
                echo -e "${GREEN}已停止服务 (PID: $pid)${NC}"
            fi
            rm -f $pid_file
        fi
    done
}

# 重启所有服务
restart_all() {
    echo -e "${BLUE}重启所有服务...${NC}"
    stop_all
    sleep 2
    start_all
}

# 启动所有服务
start_all() {
    echo -e "${BLUE}启动 Negaihoshi 系统...${NC}"
    
    check_dependencies
    install_frontend_deps
    
    start_backend
    sleep 2
    
    start_main_frontend
    sleep 1
    
    start_admin_frontend
    sleep 1
    
    show_status
    
    echo -e "${GREEN}所有服务启动完成!${NC}"
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "  主前端: http://localhost:3000"
    echo -e "  管理员前端: http://localhost:3001"
    echo -e "  后端API: http://localhost:9292"
    echo -e "  API文档: http://localhost:9292/api/docs"
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
        "backend")
            start_backend
            ;;
        "main-frontend")
            start_main_frontend
            ;;
        "admin-frontend")
            start_admin_frontend
            ;;
        "install")
            install_frontend_deps
            ;;
        *)
            echo -e "${YELLOW}用法: $0 [start|stop|restart|status|backend|main-frontend|admin-frontend|install]${NC}"
            echo -e "${BLUE}命令说明:${NC}"
            echo -e "  start          - 启动所有服务"
            echo -e "  stop           - 停止所有服务"
            echo -e "  restart        - 重启所有服务"
            echo -e "  status         - 显示服务状态"
            echo -e "  backend        - 仅启动后端服务"
            echo -e "  main-frontend  - 仅启动主前端服务"
            echo -e "  admin-frontend - 仅启动管理员前端服务"
            echo -e "  install        - 安装前端依赖"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
