/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-07-26 20:27:08
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-13 21:07:09
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\Navigation.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState } from 'react';
import { AuthPanel } from './AuthPanel';

interface NavigationProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export function Navigation({ isLoggedIn, onLoginSuccess, onLogout }: NavigationProps) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      {/* 简化后的导航栏 */}
      <nav className="bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-cyan-600/90 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Logo和标题 */}
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-white">星の海の物語</h1>
                <p className="text-sm text-blue-100 hidden sm:block">在星空下分享你的心情</p>
              </div>
            </div>

            {/* 导航链接和用户状态 */}
            <div className="flex items-center justify-center sm:justify-end space-x-6">
              <a href="#home" className="text-white/90 hover:text-white transition-colors duration-200 font-medium">
                首页
              </a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors duration-200 font-medium">
                关于
              </a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors duration-200 font-medium">
                联系
              </a>
              
              {/* 用户状态区域 */}
              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  <>
                    <span className="text-white/80 text-sm hidden sm:inline">欢迎回来</span>
                    <button
                      onClick={onLogout}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors text-sm"
                    >
                      登出
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
                  >
                    登录
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 登录界面 - 独立显示，不合并到导航中 */}
      {showAuth && (
        <AuthPanel 
          isLoggedIn={isLoggedIn}
          onLoginSuccess={() => {
            onLoginSuccess();
            setShowAuth(false);
          }}
          onLogout={onLogout}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}