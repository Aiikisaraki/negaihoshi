#!/bin/bash

# 版本检查脚本
# 用于检测第三级版本号变更并触发自动构建

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置文件路径
CONFIG_FILE="config.json"
VERSION_FILE=".version"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查配置文件是否存在
check_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "配置文件 $CONFIG_FILE 不存在"
        exit 1
    fi
}

# 从配置文件读取版本号
get_version_from_config() {
    local version=$(grep '"version"' "$CONFIG_FILE" | sed 's/.*"version": *"\([^"]*\)".*/\1/')
    echo "$version"
}

# 从配置文件读取版本后缀
get_version_suffix_from_config() {
    local suffix=$(grep '"version_suffix"' "$CONFIG_FILE" | sed 's/.*"version_suffix": *"\([^"]*\)".*/\1/')
    echo "$suffix"
}

# 解析版本号
parse_version() {
    local version="$1"
    local major=$(echo "$version" | cut -d. -f1)
    local minor=$(echo "$version" | cut -d. -f2)
    local patch=$(echo "$version" | cut -d. -f3 | cut -d- -f1)
    local suffix=$(echo "$version" | cut -d- -f2-)
    
    echo "$major $minor $patch $suffix"
}

# 检查版本号是否有效
validate_version() {
    local version="$1"
    if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]]; then
        log_error "无效的版本号格式: $version"
        log_error "版本号格式应为: X.Y.Z 或 X.Y.Z-suffix"
        exit 1
    fi
}

# 检查第三级版本号是否变更
check_patch_version_change() {
    local current_version="$1"
    local previous_version="$2"
    
    if [ -z "$previous_version" ]; then
        log_info "首次运行，创建版本记录"
        return 0
    fi
    
    # 解析版本号
    local current_parts=($(parse_version "$current_version"))
    local previous_parts=($(parse_version "$previous_version"))
    
    local current_patch="${current_parts[2]}"
    local previous_patch="${previous_parts[2]}"
    
    if [ "$current_patch" != "$previous_patch" ]; then
        log_success "检测到第三级版本号变更: $previous_patch -> $current_patch"
        return 0
    else
        log_info "第三级版本号未变更: $current_patch"
        return 1
    fi
}

# 保存当前版本号
save_version() {
    local version="$1"
    echo "$version" > "$VERSION_FILE"
    log_info "已保存版本号: $version"
}

# 主函数
main() {
    log_info "开始版本检查..."
    
    # 检查配置文件
    check_config
    
    # 获取当前版本号
    local current_version=$(get_version_from_config)
    local current_suffix=$(get_version_suffix_from_config)
    
    # 组合完整版本号
    local full_version="$current_version"
    if [ -n "$current_suffix" ]; then
        full_version="$current_version-$current_suffix"
    fi
    
    log_info "当前版本号: $full_version"
    
    # 验证版本号格式
    validate_version "$full_version"
    
    # 读取之前保存的版本号
    local previous_version=""
    if [ -f "$VERSION_FILE" ]; then
        previous_version=$(cat "$VERSION_FILE")
        log_info "之前版本号: $previous_version"
    fi
    
    # 检查第三级版本号变更
    if check_patch_version_change "$full_version" "$previous_version"; then
        log_success "版本号变更检测成功，可以触发自动构建"
        save_version "$full_version"
        exit 0
    else
        log_info "版本号未变更，无需触发构建"
        save_version "$full_version"
        exit 1
    fi
}

# 运行主函数
main "$@"
