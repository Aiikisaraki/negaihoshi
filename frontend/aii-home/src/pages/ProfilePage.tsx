import { useState } from 'react';
import { ProfilePanel } from '../components/ProfilePanel';

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

interface ProfilePageProps {
  profileData: ProfileData;
  onProfileUpdate: (data: ProfileData) => void;
}

export function ProfilePage({ profileData, onProfileUpdate }: ProfilePageProps) {
  const [showEditPanel, setShowEditPanel] = useState(false);

  const handleProfileSave = async (data: ProfileData) => {
    try {
      // 调用父组件的更新方法
      onProfileUpdate(data);
      setShowEditPanel(false);
    } catch (error) {
      console.error('更新个人资料失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
      <div className="w-full max-w-4xl p-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">个人中心</h1>
          <p className="text-lg text-blue-600">管理你的个人信息和设置</p>
        </div>

        {/* 个人资料卡片 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 mb-8">
          {/* 头像和基本信息 */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-6 border-blue-200 mx-auto mb-6 shadow-lg">
              {profileData.avatar ? (
                <img 
                  src={profileData.avatar.startsWith('http') ? profileData.avatar : `http://localhost:9292${profileData.avatar}`} 
                  alt="头像" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-blue-800 mb-3">
              {profileData.nickname || profileData.username}
            </h2>
            <p className="text-lg text-blue-600 mb-6 max-w-2xl mx-auto">
              {profileData.bio || '这个人很懒，什么都没有留下...'}
            </p>
            <button
              onClick={() => setShowEditPanel(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium shadow-lg"
            >
              编辑个人资料
            </button>
          </div>

          {/* 详细信息网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 基本信息 */}
            <div className="bg-white/60 rounded-2xl p-6 backdrop-blur-sm border border-white/50">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                基本信息
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-600 font-medium">用户名</span>
                  <span className="text-blue-800 font-semibold">{profileData.username}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-600 font-medium">邮箱</span>
                  <span className="text-blue-800 font-semibold">{profileData.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-600 font-medium">昵称</span>
                  <span className="text-blue-800 font-semibold">{profileData.nickname || '未设置'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-600 font-medium">手机</span>
                  <span className="text-blue-800 font-semibold">{profileData.phone || '未设置'}</span>
                </div>
              </div>
            </div>

            {/* 其他信息 */}
            <div className="bg-white/60 rounded-2xl p-6 backdrop-blur-sm border border-white/50">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                其他信息
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-600 font-medium">位置</span>
                  <span className="text-blue-800 font-semibold">{profileData.location || '未设置'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-600 font-medium">网站</span>
                  <span className="text-blue-800 font-semibold">
                    {profileData.website ? (
                      <a 
                        href={profileData.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-500 underline"
                      >
                        {profileData.website}
                      </a>
                    ) : (
                      '未设置'
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-600 font-medium">注册时间</span>
                  <span className="text-blue-800 font-semibold">
                    {profileData.ctime ? new Date(profileData.ctime).toLocaleDateString('zh-CN') : '未知'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-600 font-medium">最后更新</span>
                  <span className="text-blue-800 font-semibold">
                    {profileData.utime ? new Date(profileData.utime).toLocaleDateString('zh-CN') : '未知'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white text-center shadow-lg">
            <div className="text-3xl font-bold mb-2">0</div>
            <div className="text-blue-100">发布动态</div>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg">
            <div className="text-3xl font-bold mb-2">0</div>
            <div className="text-purple-100">获得点赞</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl p-6 text-white text-center shadow-lg">
            <div className="text-3xl font-bold mb-2">0</div>
            <div className="text-cyan-100">关注用户</div>
          </div>
        </div>
      </div>

      {/* 个人资料编辑面板 */}
      <ProfilePanel
        isVisible={showEditPanel}
        onClose={() => setShowEditPanel(false)}
        profileData={profileData}
        onSave={handleProfileSave}
      />
    </div>
  );
}
