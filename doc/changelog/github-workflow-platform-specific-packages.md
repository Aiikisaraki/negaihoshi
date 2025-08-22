# GitHub工作流平台特定打包更新

**日期**: 2025-01-27  
**版本**: 1.0.1.4-beta  
**类型**: 功能改进  

## 📋 概述

将GitHub Actions工作流从单一多平台压缩包改为按平台分别打包，提供更好的用户体验和更小的下载体积。

## 🔄 主要变更

### 1. 自动发布工作流 (`auto-release.yml`)

#### 变更前
- 创建单一的多平台压缩包：`negaihoshi-{version}-multi-platform.zip`
- 包含所有平台的可执行文件
- 用户需要下载包含所有平台文件的压缩包

#### 变更后
- 创建四个平台特定的压缩包：
  - `negaihoshi-{version}-linux-amd64.zip`
  - `negaihoshi-{version}-windows-amd64.zip`
  - `negaihoshi-{version}-darwin-amd64.zip`
  - `negaihoshi-{version}-darwin-arm64.zip`
- 每个包只包含对应平台的可执行文件
- 用户只需下载对应平台的压缩包

### 2. 手动发布工作流 (`manual-release.yml`)

#### 变更前
- 创建单一的手动发布压缩包：`negaihoshi-manual-{run_number}.zip`
- 包含所有平台的可执行文件

#### 变更后
- 创建四个平台特定的压缩包：
  - `negaihoshi-manual-{run_number}-linux-amd64.zip`
  - `negaihoshi-manual-{run_number}-windows-amd64.zip`
  - `negaihoshi-manual-{run_number}-darwin-amd64.zip`
  - `negaihoshi-manual-{run_number}-darwin-arm64.zip`

### 3. 打包结构优化

#### 每个平台包包含
- 平台特定的后端可执行文件
- 平台特定的启动脚本
- 前端构建文件 (`frontend-main/`, `frontend-admin/`)
- 配置文件 (`config.json`, `docker-compose.yml`)
- 启动脚本目录 (`scripts/`)
- 项目文档 (`README.md`)

#### 启动脚本
- **Linux/macOS**: `start.sh` (bash脚本)
- **Windows**: `start.bat` (批处理脚本)

## 🎯 优势

### 1. 下载体积优化
- 用户只需下载对应平台的压缩包
- 减少不必要的文件下载
- 更快的下载速度

### 2. 用户体验改善
- 清晰的平台标识
- 简化的安装过程
- 减少用户困惑

### 3. 维护便利性
- 平台特定的问题更容易定位
- 独立的版本管理
- 更好的测试覆盖

## 📦 文件结构

### 自动发布包命名
```
negaihoshi-{version}-{platform}-{arch}.zip
```

### 手动发布包命名
```
negaihoshi-manual-{run_number}-{platform}-{arch}.zip
```

### 平台标识
- `linux-amd64`: Linux x86_64
- `windows-amd64`: Windows x86_64
- `darwin-amd64`: macOS Intel
- `darwin-arm64`: macOS Apple Silicon

## 🔧 技术实现

### 1. 构建流程
1. 构建所有平台的后端可执行文件
2. 构建前端项目
3. 为每个平台创建独立的目录结构
4. 复制平台特定的可执行文件和启动脚本
5. 复制通用的前端构建文件和配置文件
6. 创建平台特定的压缩包

### 2. 发布流程
1. 上传所有平台特定的压缩包到GitHub Release
2. 生成详细的发布说明
3. 提供平台特定的安装指南

## 📝 使用说明

### 下载对应平台的Release包
1. 访问GitHub Releases页面
2. 选择最新的Release版本
3. 下载对应你操作系统的压缩包

### 安装和启动
1. 解压下载的压缩包
2. 运行平台特定的启动脚本：
   - **Linux/macOS**: `./start.sh`
   - **Windows**: `start.bat`

## 🔄 向后兼容性

- 现有的Release包仍然可用
- 新的平台特定包提供更好的体验
- 用户可以根据需要选择下载方式

## 📈 影响评估

### 正面影响
- ✅ 减少下载体积
- ✅ 改善用户体验
- ✅ 提高维护效率
- ✅ 更好的平台支持

### 注意事项
- ⚠️ 需要更新文档说明
- ⚠️ 用户需要选择正确的平台包
- ⚠️ 可能需要更新CI/CD脚本

## 🚀 未来计划

1. **自动化测试**: 为每个平台包添加自动化测试
2. **签名验证**: 为可执行文件添加数字签名
3. **增量更新**: 支持增量更新机制
4. **容器化**: 提供Docker镜像作为替代方案

## 📚 相关文档

- [GitHub Actions 工作流文档](https://docs.github.com/en/actions)
- [Release 管理最佳实践](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [多平台构建指南](https://golang.org/doc/install/source#environment)

---

**维护者**: Aii如樱如月  
**审核状态**: ✅ 已审核  
**部署状态**: 🚀 已部署
