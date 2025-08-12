/*
 * @Author: Aii如樱如月 morikawa2021@163.com
 * @Date: 2025-07-26 20:27:08
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-12 21:20:02
 * @FilePath: \negaihoshi\frontend\aii-home\src\App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Timeline } from './components/Timeline';
import { EditorPanel } from './components/EditorPanel';
import { WordPressPanel } from './components/WordPressPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { BackgroundSettings } from './components/BackgroundSettings';

// 个人资料数据类型
interface ProfileData {
  username: string;
  email: string;
  nickname: string;
  bio: string;
  avatar: string;
  phone: string;
  location: string;
  website: string;
}

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'wordpress' | 'profile'>('home');
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    email: '',
    nickname: '',
    bio: '',
    avatar: '',
    phone: '',
    location: '',
    website: ''
  });

  // 检查本地存储的登录状态
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
      // 从本地存储加载个人资料数据
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          setProfileData(JSON.parse(savedProfile));
        } catch (error) {
          console.error('解析个人资料数据失败:', error);
        }
      }
    }
  }, []);

  const handlePostSuccess = () => {
    // 触发时间线刷新
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    
    // 设置默认个人资料数据
    const defaultProfile: ProfileData = {
      username: 'user',
      email: 'user@example.com',
      nickname: '新用户',
      bio: '欢迎来到星の海の物語！',
      avatar: '',
      phone: '',
      location: '',
      website: ''
    };
    setProfileData(defaultProfile);
    localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    setProfileData({
      username: '',
      email: '',
      nickname: '',
      bio: '',
      avatar: '',
      phone: '',
      location: '',
      website: ''
    });
    setCurrentTab('home');
  };

  const handleProfileSave = (data: ProfileData) => {
    setProfileData(data);
    localStorage.setItem('userProfile', JSON.stringify(data));
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-200 via-blue-200 via-cyan-200 to-blue-300">
        {/* 整合后的导航栏 - 包含登录状态显示区域 */}
        <Navigation 
          isLoggedIn={isLoggedIn}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
        
        {/* 主内容区域 - 合并后的毛玻璃卡片效果 */}
        <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="main-content-glass rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl max-w-6xl mx-auto">
            {/* 标题和标签页区域 */}
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
                  <button
                    onClick={() => setCurrentTab('profile')}
                    className={`px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 text-sm sm:text-base font-medium ${
                      currentTab === 'profile' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-white/30 text-blue-700 hover:bg-white/50 border border-white/40'
                    }`}
                  >
                    个人中心
                  </button>
                </div>
              )}
            </div>

            {/* 内容区域 */}
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
            ) : currentTab === 'wordpress' ? (
              <WordPressPanel />
            ) : (
              <Section title="个人中心">
                {isLoggedIn ? (
                  <div className="text-center p-8 sm:p-10">
                    <div className="mb-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 mx-auto mb-4">
                        {profileData.avatar ? (
                          <img 
                            src={profileData.avatar} 
                            alt="头像" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-blue-800 mb-2">
                        {profileData.nickname || profileData.username}
                      </h3>
                      <p className="text-blue-600 mb-4">
                        {profileData.bio || '这个人很懒，什么都没有留下...'}
                      </p>
                      <button
                        onClick={handleProfileClick}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium shadow-lg"
                      >
                        编辑个人资料
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm border border-white/30">
                        <h4 className="text-lg font-semibold text-blue-800 mb-4">基本信息</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-blue-600 font-medium">用户名：</span>
                            <span className="text-blue-800">{profileData.username}</span>
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">邮箱：</span>
                            <span className="text-blue-800">{profileData.email}</span>
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">昵称：</span>
                            <span className="text-blue-800">{profileData.nickname || '未设置'}</span>
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">手机：</span>
                            <span className="text-blue-800">{profileData.phone || '未设置'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm border border-white/30">
                        <h4 className="text-lg font-semibold text-blue-800 mb-4">其他信息</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-blue-600 font-medium">位置：</span>
                            <span className="text-blue-800">{profileData.location || '未设置'}</span>
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">网站：</span>
                            <span className="text-blue-800">
                              {profileData.website ? (
                                <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline">
                                  {profileData.website}
                                </a>
                              ) : (
                                '未设置'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 sm:p-10 text-blue-700">
                    <p className="mb-4 text-lg sm:text-xl">请先登录</p>
                    <p className="text-base sm:text-lg text-blue-600">登录后即可查看和编辑个人资料</p>
                  </div>
                )}
              </Section>
            )}
          </div>
        </main>

        {/* 背景设置组件 */}
        <BackgroundSettings />

        {/* 个人资料编辑面板 */}
        <ProfilePanel
          isVisible={showProfile}
          onClose={() => setShowProfile(false)}
          profileData={profileData}
          onSave={handleProfileSave}
        />
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
