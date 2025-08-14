import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Timeline } from './components/Timeline';
import { EditorPanel } from './components/EditorPanel';
import { WordPressPanel } from './components/WordPressPanel';
import { ProfilePage } from './pages/ProfilePage';
import { BackgroundSettings } from './components/BackgroundSettings';
import apiClient, { APIResponse } from './requests/api';

// 个人资料数据类型
interface ProfileData {
  id?: number;
  username: string;
  email: string;
  nickname: string;
  bio: string;
  avatar: string;
  phone: string;
  location: string;
  website: string;
  ctime?: string;
  utime?: string;
}

// 主应用内容组件
function AppContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'wordpress'>('home');
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

  const navigate = useNavigate();
  const location = useLocation();

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

  // 根据当前路由设置标签页
  useEffect(() => {
    if (location.pathname === '/profile') {
      setCurrentTab('home'); // 重置标签页，因为个人中心现在是独立页面
    }
  }, [location.pathname]);

  const handlePostSuccess = () => {
    // 触发时间线刷新
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoginSuccess = async () => {
    console.log('登录成功，开始获取用户信息...');
    setIsLoggedIn(true);
    
    try {
      // 从服务器获取最新的个人资料
      console.log('正在获取用户个人资料...');
      const response = await apiClient.get('/users/profile') as APIResponse<ProfileData>;
      console.log('获取个人资料响应:', response);
      
      if (response.code === 200 && response.data) {
        console.log('个人资料获取成功:', response.data);
        setProfileData(response.data);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userProfile', JSON.stringify(response.data));
      } else {
        throw new Error(response.message || '获取个人资料失败');
      }
    } catch (error: unknown) {
      console.error('获取个人资料失败:', error);
      // 如果获取失败，使用默认数据
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
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
    }
  };

  const handleLogout = async () => {
    try {
      // 调用后端logout接口清除session
      await apiClient.post('/users/logout');
      console.log('后端session已清除');
    } catch (error) {
      console.error('清除后端session失败:', error);
      // 即使后端调用失败，也要清除前端状态
    }
    
    // 清除前端状态
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
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-200 via-blue-200 via-cyan-200 to-blue-300">
        {/* 整合后的导航栏 - 包含登录状态显示区域 */}
        <Navigation 
          isLoggedIn={isLoggedIn}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
          userProfile={isLoggedIn ? profileData : undefined}
        />
        
        {/* 主内容区域 - 合并后的毛玻璃卡片效果 */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="main-content-glass rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl w-full max-w-6xl">
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
            ) : (
              <WordPressPanel />
            )}
          </div>
        </main>

        {/* 背景设置组件 */}
        <BackgroundSettings />
      </div>
    </>
  );
}

// 主应用组件
export default function App() {
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const handleProfileUpdate = async (data: ProfileData) => {
    try {
      // 更新服务器上的个人资料
      const response = await apiClient.put('/users/profile', data) as APIResponse;
      
      if (response.code === 200) {
        setProfileData(data);
        localStorage.setItem('userProfile', JSON.stringify(data));
      } else {
        throw new Error(response.message || '更新失败');
      }
    } catch (error: unknown) {
      console.error('更新个人资料失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`更新个人资料失败: ${errorMessage}`);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route 
          path="/profile" 
          element={
            isLoggedIn ? (
              <ProfilePage 
                profileData={profileData}
                onProfileUpdate={handleProfileUpdate}
              />
            ) : (
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-blue-800 mb-4">请先登录</h1>
                  <p className="text-blue-600 mb-6">登录后即可查看和编辑个人资料</p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-all duration-200"
                  >
                    返回首页
                  </button>
                </div>
              </div>
            )
          } 
        />
      </Routes>
    </Router>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-6 sm:p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
    <h2 className="text-2xl font-semibold text-blue-800 mb-6">{title}</h2>
    {children}
  </div>
);