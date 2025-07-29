/*
 * @Author: Aiikisaraki morikawa@kimisui56.work
 * @Date: 2025-05-25 10:42:45
 * @LastEditors: Aii如樱如月 morikawa2021@163.com
 * @LastEditTime: 2025-07-29 23:54:50
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { motion } from 'framer-motion';
import { ChevronDown, UserCircle, Home, Pencil, Sparkles } from 'heroicons-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const Navigation = () => {
  return (
    <motion.nav
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      className="backdrop-glass px-6 py-4 border-b border-white/20"
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* 左侧Logo */}
        <div className="flex items-center space-x-4">
          <Sparkles className="text-pink-400 w-8 h-8" />
          <span className="bg-gradient-to-r from-blue-400 to-pink-300 bg-clip-text text-transparent text-2xl font-bold">
            星语树洞
          </span>
        </div>

        {/* 导航菜单 */}
        <div className="hidden md:flex flex-row items-center space-x-8">
          <NavLink icon={<Home />} label="首页" />
          <NavLink icon={<Pencil />} label="动态" />
          <NavLink icon={<Sparkles />} label="创作空间" />
          
          {/* 用户菜单 */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors">
              <UserCircle className="w-6 h-6" />
              <ChevronDown className="w-4 h-4" />
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Content 
              className="min-w-[200px] backdrop-glass rounded-xl p-2 shadow-lg"
              sideOffset={8}
            >
              <DropdownMenu.Item className="dropdown-item">个人中心</DropdownMenu.Item>
              <DropdownMenu.Item className="dropdown-item">消息通知</DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-white/20 my-2" />
              <DropdownMenu.Item className="dropdown-item text-red-400">退出登录</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="flex items-center space-x-2 text-white/90 hover:text-white cursor-pointer"
  >
    <span className="w-5 h-5">{icon}</span>
    <span className="font-medium">{label}</span>
  </motion.div>
);