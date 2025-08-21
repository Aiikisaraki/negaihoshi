import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient, { APIResponse } from '../../requests/api';
import { userApi } from '../../requests/posts';
import { AvatarEditor } from './AvatarEditor';
import { WordPressPanel } from '../wordpress/WordPressPanel';
import AvatarImage from './AvatarImage';
import { useToast } from '../feedback/Toast';

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
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const toast = useToast();

  useEffect(() => {
    setProfile(profileData);
  }, [profileData]);

  useEffect(() => {
    if (!isVisible) return;
    (async () => {
      try {
        const resp = await userApi.getAvatar();
        if (resp.code === 200 && resp.data?.avatar_url) {
          setProfile(prev => ({ ...prev, avatar: resp.data!.avatar_url }));
        }
      } catch (e) {
        console.debug('获取头像失败: ', e);
      }
    })();
  }, [isVisible]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.show('请选择图片文件', { type: 'warning' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.show('图片文件大小不能超过5MB', { type: 'warning' });
      return;
    }
    setSelectedFile(file);
    setEditorOpen(true);
  };

  const uploadEditedBlob = async (blob: Blob) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      const editedFile = new File([blob], 'avatar_edited.jpg', { type: 'image/jpeg' });
      formData.append('avatar', editedFile);
      const response = await apiClient.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      }) as APIResponse<{ avatar_url: string }>;
      if (response.code === 200 && response.data?.avatar_url) {
        const newAvatar = response.data.avatar_url;
        handleInputChange('avatar', newAvatar);
        onSave({ ...profile, avatar: newAvatar });
        setUploadProgress(100);
        toast.show('头像上传成功', { type: 'success' });
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error) {
      console.error('头像上传失败:', error);
      toast.show('头像上传失败，请稍后重试', { type: 'error' });
    } finally {
      setIsUploading(false);
      setEditorOpen(false);
      setSelectedFile(null);
    }
  };

  const handleSave = async () => {
    onSave(profile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(profileData);
    setIsEditing(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border白色/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border白色/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text白色">个人中心</h2>
            <button onClick={onClose} className="text白色/50 hover:text白色/80 transition-colors hover:bg白色/10 rounded-full p-2" title="关闭个人中心" aria-label="关闭个人中心">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg白色/5 rounded-xl p-6 border border白色/10">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border白色/20 mx-auto mb-4">
                      <AvatarImage src={profile.avatar} className="w-full h-full object-cover" />
                    </div>
                    {isUploading && (
                      <div className="w-full bg白色/10 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" data-width-pct={uploadProgress} />
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" aria-label="选择头像图片文件" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text白色 transition-all duration-200 text-sm" title="点击选择头像图片文件">
                      {isUploading ? '上传中...' : '更换头像'}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text白色/60 mb-1">用户名</label>
                    <div className="text白色 font-medium">{profile.username}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text白色/60 mb-1">邮箱</label>
                    <div className="text白色/80">{profile.email}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg白色/5 rounded-xl p-6 border border白色/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text白色">个人信息</h3>
                  <div className="space-x-3">
                    {isEditing ? (
                      <>
                        <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text白色 transition-all duration-200 text-sm" title="保存个人信息">保存</button>
                        <button onClick={handleCancel} className="px-4 py-2 bg白色/10 hover:bg白色/20 text白色 rounded-lg transition-all duration-200 text-sm" title="取消编辑">取消</button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text白色 transition-all duration-200 text-sm" title="编辑个人信息">编辑</button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text白色/60 mb-2">昵称</label>
                    {isEditing ? (
                      <input type="text" value={profile.nickname} onChange={(e) => handleInputChange('nickname', e.target.value)} className="w-full px-3 py-2 bg白色/10 border border白色/20 rounded-lg text白色 placeholder白色/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="请输入昵称" />
                    ) : (
                      <div className="text白色">{profile.nickname || '未设置'}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text白色/60 mb-2">手机号</label>
                    {isEditing ? (
                      <input type="tel" value={profile.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-3 py-2 bg白色/10 border border白色/20 rounded-lg text白色 placeholder白色/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="请输入手机号" />
                    ) : (
                      <div className="text白色">{profile.phone || '未设置'}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text白色/60 mb-2">位置</label>
                    {isEditing ? (
                      <input type="text" value={profile.location} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full px-3 py-2 bg白色/10 border border白色/20 rounded-lg text白色 placeholder白色/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="请输入位置" />
                    ) : (
                      <div className="text白色">{profile.location || '未设置'}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text白色/60 mb-2">个人网站</label>
                    {isEditing ? (
                      <input type="url" value={profile.website} onChange={(e) => handleInputChange('website', e.target.value)} className="w-full px-3 py-2 bg白色/10 border border白色/20 rounded-lg text白色 placeholder白色/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="请输入网站地址" />
                    ) : (
                      <div className="text白色">{profile.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">{profile.website}</a> : '未设置'}</div>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text白色/60 mb-2">个人简介</label>
                  {isEditing ? (
                    <textarea value={profile.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={4} className="w-full px-3 py-2 bg白色/10 border border白色/20 rounded-lg text白色 placeholder白色/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none" placeholder="请输入个人简介" />
                  ) : (
                    <div className="text白色/80 bg白色/5 rounded-lg p-3 min-h-[80px]">{profile.bio || '这个人很懒，什么都没有留下...'}</div>
                  )}
                </div>
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text白色 mb-3">WordPress 设置</h4>
                  <div className="bg白色/5 rounded-xl p-4 border border白色/10">
                    <WordPressPanel />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {editorOpen && (
        <AvatarEditor file={selectedFile} initialUrl={undefined} onCancel={() => { setEditorOpen(false); setSelectedFile(null); }} onConfirm={(blob) => uploadEditedBlob(blob)} />
      )}
    </motion.div>
  );
}


