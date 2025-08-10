#!/bin/bash

# 版本管理工具
# 用于更新配置文件中的版本号

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

# 显示帮助信息
show_help() {
    echo "版本管理工具"
    echo ""
    echo "用法: $0 [命令] [参数]"
    echo ""
    echo "命令:"
    echo "  show                   显示当前版本号"
    echo "  bump [major|minor|patch] 增加版本号"
    echo "  set <version>          设置指定版本号"
    echo "  suffix <suffix>        设置版本后缀"
    echo "  clear-suffix           清除版本后缀"
    echo "  help                   显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 show                 # 显示当前版本"
    echo "  $0 bump patch           # 增加补丁版本号 (1.0.0 -> 1.0.1)"
    echo "  $0 bump minor           # 增加次要版本号 (1.0.0 -> 1.1.0)"
    echo "  $0 bump major           # 增加主要版本号 (1.0.0 -> 2.0.0)"
    echo "  $0 set 1.2.3           # 设置版本号为 1.2.3"
    echo "  $0 suffix beta          # 设置版本后缀为 beta (1.0.0-beta)"
    echo "  $0 clear-suffix         # 清除版本后缀"
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

# 更新配置文件中的版本号
update_version_in_config() {
    local new_version="$1"
    local temp_file=$(mktemp)
    
    # 使用sed更新版本号
    sed "s/\"version\": *\"[^\"]*\"/\"version\": \"$new_version\"/" "$CONFIG_FILE" > "$temp_file"
    mv "$temp_file" "$CONFIG_FILE"
    
    log_success "版本号已更新为: $new_version"
}

# 更新配置文件中的版本后缀
update_suffix_in_config() {
    local new_suffix="$1"
    local temp_file=$(mktemp)
    
    # 使用sed更新版本后缀
    sed "s/\"version_suffix\": *\"[^\"]*\"/\"version_suffix\": \"$new_suffix\"/" "$CONFIG_FILE" > "$temp_file"
    mv "$temp_file" "$CONFIG_FILE"
    
    log_success "版本后缀已更新为: $new_suffix"
}

# 验证版本号格式
validate_version() {
    local version="$1"
    if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_error "无效的版本号格式: $version"
        log_error "版本号格式应为: X.Y.Z"
        exit 1
    fi
}

# 解析版本号
parse_version() {
    local version="$1"
    local major=$(echo "$version" | cut -d. -f1)
    local minor=$(echo "$version" | cut -d. -f2)
    local patch=$(echo "$version" | cut -d. -f3)
    
    echo "$major $minor $patch"
}

# 增加版本号
bump_version() {
    local bump_type="$1"
    local current_version=$(get_version_from_config)
    local current_suffix=$(get_version_suffix_from_config)
    
    log_info "当前版本号: $current_version"
    
    # 解析当前版本号
    local parts=($(parse_version "$current_version"))
    local major="${parts[0]}"
    local minor="${parts[1]}"
    local patch="${parts[2]}"
    
    case "$bump_type" in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch")
            patch=$((patch + 1))
            ;;
        *)
            log_error "无效的版本类型: $bump_type"
            log_error "支持的类型: major, minor, patch"
            exit 1
            ;;
    esac
    
    local new_version="$major.$minor.$patch"
    update_version_in_config "$new_version"
    
    # 显示完整版本号
    local full_version="$new_version"
    if [ -n "$current_suffix" ]; then
        full_version="$new_version-$current_suffix"
    fi
    
    log_success "版本号已增加到: $full_version"
}

# 设置版本号
set_version() {
    local new_version="$1"
    
    if [ -z "$new_version" ]; then
        log_error "请指定版本号"
        exit 1
    fi
    
    validate_version "$new_version"
    update_version_in_config "$new_version"
    
    # 显示完整版本号
    local current_suffix=$(get_version_suffix_from_config)
    local full_version="$new_version"
    if [ -n "$current_suffix" ]; then
        full_version="$new_version-$current_suffix"
    fi
    
    log_success "版本号已设置为: $full_version"
}

# 设置版本后缀
set_suffix() {
    local new_suffix="$1"
    
    if [ -z "$new_suffix" ]; then
        log_error "请指定版本后缀"
        exit 1
    fi
    
    update_suffix_in_config "$new_suffix"
    
    # 显示完整版本号
    local current_version=$(get_version_from_config)
    local full_version="$current_version-$new_suffix"
    
    log_success "版本后缀已设置为: $full_version"
}

# 清除版本后缀
clear_suffix() {
    update_suffix_in_config ""
    
    local current_version=$(get_version_from_config)
    log_success "版本后缀已清除，当前版本: $current_version"
}

# 显示当前版本信息
show_version() {
    local version=$(get_version_from_config)
    local suffix=$(get_version_suffix_from_config)
    
    echo "当前版本信息:"
    echo "  版本号: $version"
    echo "  后缀: ${suffix:-无}"
    
    local full_version="$version"
    if [ -n "$suffix" ]; then
        full_version="$version-$suffix"
    fi
    
    echo "  完整版本: $full_version"
}

# 主函数
main() {
    local command="$1"
    local arg="$2"
    
    # 检查配置文件
    check_config
    
    case "$command" in
        "show")
            show_version
            ;;
        "bump")
            if [ -z "$arg" ]; then
                log_error "请指定版本类型 (major|minor|patch)"
                exit 1
            fi
            bump_version "$arg"
            ;;
        "set")
            set_version "$arg"
            ;;
        "suffix")
            set_suffix "$arg"
            ;;
        "clear-suffix")
            clear_suffix
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
