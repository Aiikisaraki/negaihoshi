/*
 * @Author: Aiikisaraki morikawa@kimisui56.work
 * @Date: 2025-05-25 10:42:45
 * @LastEditors: Aii如樱如月 morikawa2021@163.com
 * @LastEditTime: 2025-07-29 23:54:50
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\Navigation.tsx
 * @Description: 导航栏组件
 */
import { motion } from 'framer-motion';
import { AuthPanel } from './AuthPanel';

interface NavigationProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const Navigation = ({ isLoggedIn, onLoginSuccess, onLogout }: NavigationProps) => {
  return (
    <motion.nav
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      className="backdrop-blur-xl bg-white/5 px-6 py-4 border-b border-white/20"
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* 左侧Logo */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">星</span>
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-pink-300 bg-clip-text text-transparent text-2xl font-bold">
            negaihoshi
          </span>
        </div>

        {/* 导航菜单 */}
        <div className="flex items-center space-x-6">
          <NavLink label="树洞" />
          <NavLink label="创作" />
          {isLoggedIn && <NavLink label="我的" />}
          
          {/* 认证面板 */}
          <AuthPanel 
            isLoggedIn={isLoggedIn}
            onLoginSuccess={onLoginSuccess}
            onLogout={onLogout}
          />
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ label }: { label: string }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="text-white/70 hover:text-white cursor-pointer transition-colors"
  >
    <span className="font-medium">{label}</span>
  </motion.div>
);