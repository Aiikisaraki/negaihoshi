/*
 * @Author: Aii如樱如月 morikawa2021@163.com
 * @Date: 2025-07-26 20:27:08
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-12 21:20:02
 * @FilePath: \negaihoshi\frontend\aii-home\src\App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from 'react';
import { GlassCard } from './components/GlassCard';
import { Navigation } from './components/Navigation';
import { Timeline } from './components/Timeline';
import { EditorPanel } from './components/EditorPanel';
import { WordPressPanel } from './components/WordPressPanel';
import { AuthPanel } from './components/AuthPanel';
import { BackgroundSettings } from './components/BackgroundSettings';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'wordpress'>('home');

  // 检查本地存储的登录状态
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handlePostSuccess = () => {
    // 触发时间线刷新
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-200 via-blue-200 via-cyan-200 to-blue-300">
        <Navigation isLoggedIn={isLoggedIn} />
        
        {/* 登录状态显示区域 */}
        <div className="bg-gradient-to-r from-blue-300/30 via-purple-300/30 to-cyan-300/30 border-b border-blue-400/20">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
                  {isLoggedIn ? '欢迎来到星の海の物語' : '欢迎来到星の海の物語'}
                </h2>
                <p className="text-sm text-blue-700">
                  {isLoggedIn ? '在这里分享你的心情和想法' : '登录后即可发布动态和参与互动'}
                </p>
              </div>
              
              {/* 认证面板 */}
              <div className="flex justify-center sm:justify-end">
                <AuthPanel 
                  isLoggedIn={isLoggedIn}
                  onLoginSuccess={handleLoginSuccess}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区域 - 纯白色半透明毛玻璃效果 */}
        <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="main-content-glass rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
            <GlassCard className="max-w-6xl mx-auto bg-transparent border-none shadow-none p-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-800 text-center sm:text-left">星の海の物語</h1>
                
                {isLoggedIn && (
                  <div className="flex flex-wrap justify-center sm:justify-end space-x-3 space-y-2 sm:space-y-0">
                    <button
                      onClick={() => setCurrentTab('home')}
                      className={`px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 text-sm sm:text-base font-medium ${
                        currentTab === 'home' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'bg-white/30 text-blue-700 hover:bg-white/50 border border-white/40'
                      }`}
                    >
                      树洞
                    </button>
                    <button
                      onClick={() => setCurrentTab('wordpress')}
                      className={`px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 text-sm sm:text-base font-medium ${
                        currentTab === 'wordpress' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'bg-white/30 text-blue-700 hover:bg-white/50 border border-white/40'
                      }`}
                    >
                      WordPress
                    </button>
                  </div>
                )}
              </div>

              {currentTab === 'home' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                  <Section title="最新动态">
                    <Timeline refreshTrigger={refreshTrigger} />
                  </Section>
                  <Section title={isLoggedIn ? "创作空间" : "游客模式"}>
                    {isLoggedIn ? (
                      <EditorPanel onPostSuccess={handlePostSuccess} />
                    ) : (
                      <div className="text-center p-8 sm:p-10 text-blue-700">
                        <p className="mb-4 text-lg sm:text-xl">登录后即可发布动态</p>
                        <p className="text-base sm:text-lg text-blue-600">在星空下分享你的心情和想法</p>
                      </div>
                    )}
                  </Section>
                </div>
              ) : (
                <Section title="WordPress 集成">
                  <WordPressPanel />
                </Section>
              )}
            </GlassCard>
          </div>
        </main>

        {/* 背景设置组件 */}
        <BackgroundSettings />
      </div>
    </>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-6 sm:p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
    <h2 className="text-2xl font-semibold text-blue-800 mb-6">{title}</h2>
    {children}
  </div>
);
