/*
 * @Author: Aii如樱如月 morikawa2021@163.com
 * @Date: 2025-07-26 20:27:08
 * @LastEditors: Aii如樱如月 morikawa2021@163.com
 * @LastEditTime: 2025-07-29 23:15:05
 * @FilePath: \negaihoshi\frontend\aii-home\src\App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from 'react';
import { GlassCard } from './components/GlassCard';
import { Navigation } from './components/Navigation';
import { Timeline } from './components/Timeline';
import { EditorPanel } from './components/EditorPanel';
import { WordPressPanel } from './components/WordPressPanel';

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
      <div className="min-h-screen flex flex-col">
        <Navigation 
          isLoggedIn={isLoggedIn}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
        <main className="flex-1 container mx-auto p-6">
          <GlassCard className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">星の海の物語</h1>
              
              {isLoggedIn && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentTab('home')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentTab === 'home' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    树洞
                  </button>
                  <button
                    onClick={() => setCurrentTab('wordpress')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentTab === 'wordpress' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    WordPress
                  </button>
                </div>
              )}
            </div>

            {currentTab === 'home' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title="最新动态">
                  <Timeline refreshTrigger={refreshTrigger} />
                </Section>
                <Section title={isLoggedIn ? "创作空间" : "游客模式"}>
                  {isLoggedIn ? (
                    <EditorPanel onPostSuccess={handlePostSuccess} />
                  ) : (
                    <div className="text-center p-8 text-white/60">
                      <p className="mb-4">登录后即可发布动态</p>
                      <p className="text-sm">在星空下分享你的心情和想法</p>
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
        </main>
      </div>
    </>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4 rounded-xl bg-white/5">
    <h2 className="text-xl font-semibold text-pink-300 mb-4">{title}</h2>
    {children}
  </div>
);
