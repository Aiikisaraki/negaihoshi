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
BINARY_NAME="negaihoshi"

# 创建必要的目录
mkdir -p $LOG_DIR $PID_DIR

# 检查配置文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}错误: 配置文件 $CONFIG_FILE 不存在${NC}"
    exit 1
fi

# 检查可执行文件是否存在
if [ ! -f "$BINARY_NAME" ]; then
    echo -e "${RED}错误: 可执行文件 $BINARY_NAME 不存在${NC}"
    echo -e "${YELLOW}请确保已经编译了后端程序${NC}"
    exit 1
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
    
    # 使用编译好的可执行文件
    nohup ./$BINARY_NAME > $LOG_DIR/backend.log 2>&1 &
    echo $! > $PID_DIR/backend.pid
    
    echo -e "${GREEN}后端服务已启动 (PID: $(cat $PID_DIR/backend.pid))${NC}"
}

# 启动主前端（静态文件服务）
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
    
    # 使用Python的http.server来服务静态文件
    if [ -d "frontend-main" ]; then
        cd frontend-main
        nohup python3 -m http.server 3000 > ../$LOG_DIR/main_frontend.log 2>&1 &
        echo $! > ../$PID_DIR/main_frontend.pid
        cd ..
        echo -e "${GREEN}主前端服务已启动 (PID: $(cat $PID_DIR/main_frontend.pid))${NC}"
    else
        echo -e "${YELLOW}主前端目录不存在，跳过${NC}"
    fi
}

# 启动管理员前端（静态文件服务）
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
    
    # 使用Python的http.server来服务静态文件
    if [ -d "frontend-admin" ]; then
        cd frontend-admin
        nohup python3 -m http.server 3001 > ../$LOG_DIR/admin_frontend.log 2>&1 &
        echo $! > ../$PID_DIR/admin_frontend.pid
        cd ..
        echo -e "${GREEN}管理员前端服务已启动 (PID: $(cat $PID_DIR/admin_frontend.pid))${NC}"
    else
        echo -e "${YELLOW}管理员前端目录不存在，跳过${NC}"
    fi
}

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}检查依赖...${NC}"
    
    # 检查Python3
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}错误: Python3未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}依赖检查通过${NC}"
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
    echo -e "${BLUE}启动 Negaihoshi Release 版本...${NC}"
    
    check_dependencies
    
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
        *)
            echo -e "${YELLOW}用法: $0 [start|stop|restart|status|backend|main-frontend|admin-frontend]${NC}"
            echo -e "${BLUE}命令说明:${NC}"
            echo -e "  start          - 启动所有服务"
            echo -e "  stop           - 停止所有服务"
            echo -e "  restart        - 重启所有服务"
            echo -e "  status         - 显示服务状态"
            echo -e "  backend        - 仅启动后端服务"
            echo -e "  main-frontend  - 仅启动主前端服务"
            echo -e "  admin-frontend - 仅启动管理员前端服务"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
