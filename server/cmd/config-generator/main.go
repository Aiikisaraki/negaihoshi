/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-20 20:00:00
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-01-20 20:00:00
 * @FilePath: \negaihoshi\server\cmd\config-generator\main.go
 * @Description: 配置文件生成工具
 */
package main

import (
	"flag"
	"fmt"
	"os"

	"negaihoshi/server/config"
)

func main() {
	var (
		globalConfigPath  = flag.String("global", "config.json", "全局配置文件路径")
		backendConfigPath = flag.String("backend", "config/config.json", "后端配置文件输出路径")
		force             = flag.Bool("force", false, "强制重新生成配置文件")
		help              = flag.Bool("help", false, "显示帮助信息")
	)
	flag.Parse()

	if *help {
		showHelp()
		return
	}

	// 创建配置生成器
	generator := config.NewConfigGenerator(*globalConfigPath, *backendConfigPath)

	if *force {
		// 强制重新生成
		fmt.Println("强制重新生成配置文件...")
		if err := generator.GenerateConfig(); err != nil {
			fmt.Printf("生成配置文件失败: %v\n", err)
			os.Exit(1)
		}
	} else {
		// 检查是否存在，不存在则生成
		if err := generator.GenerateConfigIfNotExists(); err != nil {
			fmt.Printf("生成配置文件失败: %v\n", err)
			os.Exit(1)
		}
	}

	fmt.Println("配置文件生成完成！")
	fmt.Printf("全局配置文件: %s\n", *globalConfigPath)
	fmt.Printf("后端配置文件: %s\n", *backendConfigPath)
}

func showHelp() {
	fmt.Println("Negaihoshi 配置文件生成工具")
	fmt.Println()
	fmt.Println("用法:")
	fmt.Println("  config-generator [选项]")
	fmt.Println()
	fmt.Println("选项:")
	fmt.Println("  -global string")
	fmt.Println("        全局配置文件路径 (默认: config.json)")
	fmt.Println("  -backend string")
	fmt.Println("        后端配置文件输出路径 (默认: config/config.json)")
	fmt.Println("  -force")
	fmt.Println("        强制重新生成配置文件")
	fmt.Println("  -help")
	fmt.Println("        显示帮助信息")
	fmt.Println()
	fmt.Println("示例:")
	fmt.Println("  # 使用默认配置生成")
	fmt.Println("  config-generator")
	fmt.Println()
	fmt.Println("  # 指定配置文件路径")
	fmt.Println("  config-generator -global my-config.json -backend server/config.json")
	fmt.Println()
	fmt.Println("  # 强制重新生成")
	fmt.Println("  config-generator -force")
}
