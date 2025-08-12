import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

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

interface ProfilePanelProps {
  isVisible: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
}

export const ProfilePanel = ({ isVisible, onClose, profileData, onSave }: ProfilePanelProps) => {
  const [profile, setProfile] = useState<ProfileData>(profileData);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB限制
      alert('图片文件大小不能超过5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // 这里应该调用实际的上传API
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await uploadAvatar(formData);
      
      // 模拟上传完成
      setTimeout(() => {
        setUploadProgress(100);
        setIsUploading(false);
        
        // 创建本地预览URL
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            handleInputChange('avatar', e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }, 2000);

    } catch (error) {
      console.error('头像上传失败:', error);
      alert('头像上传失败，请重试');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = () => {
    onSave(profile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(profileData);
    setIsEditing(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">个人中心</h2>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white/80 transition-colors hover:bg-white/10 rounded-full p-2"
              title="关闭个人中心"
              aria-label="关闭个人中心"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧 - 头像和基本信息 */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                {/* 头像区域 */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mx-auto mb-4">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt="头像" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* 上传进度条 */}
                    {isUploading && (
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                    
                    {/* 上传按钮 */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      aria-label="选择头像图片文件"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all duration-200 text-sm"
                      title="点击选择头像图片文件"
                    >
                      {isUploading ? '上传中...' : '更换头像'}
                    </button>
                  </div>
                </div>

                {/* 用户名和邮箱 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">用户名</label>
                    <div className="text-white font-medium">{profile.username}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">邮箱</label>
                    <div className="text-white/80">{profile.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧 - 详细信息编辑 */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">个人信息</h3>
                  <div className="space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white transition-all duration-200 text-sm"
                          title="保存个人信息"
                        >
                          保存
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-sm"
                          title="取消编辑"
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-all duration-200 text-sm"
                        title="编辑个人信息"
                      >
                        编辑
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 昵称 */}
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">昵称</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.nickname}
                        onChange={(e) => handleInputChange('nickname', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="请输入昵称"
                      />
                    ) : (
                      <div className="text-white">{profile.nickname || '未设置'}</div>
                    )}
                  </div>

                  {/* 手机号 */}
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">手机号</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="请输入手机号"
                      />
                    ) : (
                      <div className="text-white">{profile.phone || '未设置'}</div>
                    )}
                  </div>

                  {/* 位置 */}
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">位置</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="请输入位置"
                      />
                    ) : (
                      <div className="text-white">{profile.location || '未设置'}</div>
                    )}
                  </div>

                  {/* 个人网站 */}
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">个人网站</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="请输入网站地址"
                      />
                    ) : (
                      <div className="text-white">
                        {profile.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                            {profile.website}
                          </a>
                        ) : (
                          '未设置'
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 个人简介 */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-white/60 mb-2">个人简介</label>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="请输入个人简介"
                    />
                  ) : (
                    <div className="text-white/80 bg-white/5 rounded-lg p-3 min-h-[80px]">
                      {profile.bio || '这个人很懒，什么都没有留下...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
