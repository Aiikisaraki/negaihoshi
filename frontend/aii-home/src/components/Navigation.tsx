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
  onProfileClick: () => void;
  userProfile?: {
    username: string;
    nickname?: string;
    avatar?: string;
  };
}

export function Navigation({ isLoggedIn, onLoginSuccess, onLogout, onProfileClick, userProfile }: NavigationProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      {/* 更柔和的导航栏 */}
      <nav className="bg-gradient-to-r from-blue-400/80 via-indigo-400/80 to-cyan-400/80 backdrop-blur-xl border-b border-white/30 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Logo和标题 */}
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-white">星の海の物語</h1>
                <p className="text-sm text-blue-50 hidden sm:block">在星空下分享你的心情</p>
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
                    {/* 用户头像和用户名 - 可点击显示菜单 */}
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 bg-white/20 rounded-full px-3 py-2 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/40">
                          {userProfile?.avatar ? (
                            <img 
                              src={userProfile.avatar.startsWith('http') ? userProfile.avatar : `http://localhost:9292${userProfile.avatar}`} 
                              alt="头像" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-white font-medium text-sm hidden sm:inline">
                          {userProfile?.nickname || userProfile?.username || '用户'}
                        </span>
                        {/* 下拉箭头 */}
                        <svg 
                          className={`w-4 h-4 text-white transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* 悬浮菜单 */}
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/40 overflow-hidden z-50">
                          <div className="py-2">
                            {/* 个人中心 */}
                            <button
                              onClick={() => {
                                onProfileClick();
                                setShowUserMenu(false);
                              }}
                              className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-3"
                            >
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>个人中心</span>
                            </button>
                            
                            {/* 分割线 */}
                            <div className="border-t border-gray-200 my-1"></div>
                            
                            {/* 登出按钮 */}
                            <button
                              onClick={() => {
                                onLogout();
                                setShowUserMenu(false);
                              }}
                              className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                            >
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>登出</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 rounded-lg text-white transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
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