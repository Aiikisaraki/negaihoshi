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
      {/* 主导航栏 */}
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
                    <span className="text-white/80 text-sm">欢迎回来</span>
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

      {/* 登录状态显示区域 - 整合到导航中 */}
      <div className="bg-gradient-to-r from-blue-300/30 via-purple-300/30 to-cyan-300/30 border-b border-blue-400/20">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* 欢迎信息 */}
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
                {isLoggedIn ? '欢迎来到星の海の物語' : '欢迎来到星の海の物語'}
              </h2>
              <p className="text-sm text-blue-700">
                {isLoggedIn ? '在这里分享你的心情和想法' : '登录后即可发布动态和参与互动'}
              </p>
            </div>
            
            {/* 用户操作区域 */}
            <div className="flex justify-center sm:justify-end space-x-3">
              {isLoggedIn && (
                <a 
                  href="#profile" 
                  className="px-4 py-2 bg-white/30 hover:bg-white/50 text-blue-700 rounded-lg transition-colors text-sm font-medium border border-white/40"
                >
                  个人中心
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

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
