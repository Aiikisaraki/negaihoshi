import { useEffect, useState } from 'react';
import { userApi, postApi } from '../requests/posts';
import { Link, useNavigate } from 'react-router-dom';
import { ProfilePanel } from '../components/ProfilePanel';
import apiClient from '../requests/api';

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

interface PostItem {
  id: number;
  title: string;
  content: string;
  userId: number;
  ctime?: string;
  utime?: string;
}

interface StatusItem {
  id: number;
  content: string;
  userId: number;
  ctime?: string;
  utime?: string;
}

interface ProfilePageProps {
  profileData: ProfileData;
  onProfileUpdate: (data: ProfileData) => void;
}

export function ProfilePage({ profileData, onProfileUpdate }: ProfilePageProps) {
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [viewProfile, setViewProfile] = useState<ProfileData>(profileData);
  const [activeTab, setActiveTab] = useState<'profile' | 'posts' | 'status'>('profile');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [statusList, setStatusList] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 当父级的资料变化时，同步到本地显示，保证头像等信息即时更新
  useEffect(() => {
    setViewProfile(profileData);
  }, [profileData]);

  // 初次加载或头像缺失时，主动拉取最新头像地址
  useEffect(() => {
    if (!viewProfile.avatar) {
      (async () => {
        try {
          const resp = await userApi.getAvatar();
          if (resp.code === 200 && resp.data?.avatar_url) {
            setViewProfile(prev => ({ ...prev, avatar: resp.data!.avatar_url }));
          }
        } catch (e) {
          // 忽略错误，界面仍可用
          console.debug('获取头像失败', e);
        }
      })();
    }
  }, [viewProfile.avatar]);

  // 编辑面板关闭后，拉取一次头像，确保页面头像最新
  useEffect(() => {
    if (!showEditPanel) {
      (async () => {
        try {
          const resp = await userApi.getAvatar();
          if (resp.code === 200 && resp.data?.avatar_url) {
            setViewProfile(prev => ({ ...prev, avatar: resp.data!.avatar_url }));
          }
        } catch {}
      })();
    }
  }, [showEditPanel]);

  // 获取用户的文章列表
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const resp: any = await apiClient.get('/posts/listAll?isPost=true');
      if (resp.code === 200) {
        const postsData = Array.isArray(resp.data) ? resp.data : resp.data.posts || [];
        // 过滤当前用户的文章
        const userPosts = postsData.filter((post: any) => post.userId === profileData.id);
        setPosts(userPosts);
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户的说说列表
  const fetchStatus = async () => {
    setLoading(true);
    try {
      const resp: any = await apiClient.get('/posts/listAll?isPost=false');
      if (resp.code === 200) {
        const statusData = Array.isArray(resp.data) ? resp.data : resp.data.status || [];
        // 过滤当前用户的说说
        const userStatus = statusData.filter((status: any) => status.userId === profileData.id);
        setStatusList(userStatus);
      }
    } catch (error) {
      console.error('获取说说列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换标签页时加载对应数据
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'status') {
      fetchStatus();
    }
  }, [activeTab]);

  const handleProfileSave = async (data: ProfileData) => {
    try {
      // 调用父组件的更新方法
      onProfileUpdate(data);
      // 先本地刷新，确保大头像等即时更新
      setViewProfile(data);
      setShowEditPanel(false);
    } catch (error) {
      console.error('更新个人资料失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
      {/* 顶部导航栏 */}
      <div className="w-full bg-white/70 backdrop-blur-md border-b border-white/60">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-blue-800">个人中心</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700 transition-colors">返回首页</Link>
        </div>
      </div>

      <div className="w-full max-w-4xl p-4 mx-auto">
        {/* 个人中心导航栏 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/40 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
            >
              个人资料
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'posts'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
            >
              文章管理
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'status'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
            >
              说说管理
            </button>
          </div>
        </div>

        {/* 个人资料卡片 */}
        {activeTab === 'profile' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 mb-8">
            {/* 头像（左） + 基本信息（右，纵向） */}
            <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-6 md:gap-12 mb-8 max-w-3xl mx-auto">
              {/* 左侧头像 */}
              <div className="flex-shrink-0 justify-self-center md:justify-self-end">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-6 border-blue-200 shadow-lg">
                  {viewProfile.avatar ? (
                    <img 
                      src={viewProfile.avatar.startsWith('http') ? viewProfile.avatar : `http://localhost:9292${viewProfile.avatar}`} 
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
              </div>

              {/* 右侧纵向信息 */}
              <div className="w-[360px] max-w-full justify-self-center md:justify-self-start text-center md:text-left">
                <h2 className="text-3xl font-bold text-blue-800 mb-3">
                  {viewProfile.nickname || viewProfile.username}
                </h2>
                <p className="text-lg text-blue-600 mb-6 max-w-2xl">
                  {viewProfile.bio || '这个人很懒，什么都没有留下...'}
                </p>
                <button
                  onClick={() => setShowEditPanel(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium shadow-lg"
                >
                  编辑个人资料
                </button>
              </div>
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
                    <span className="text-blue-800 font-semibold">{viewProfile.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-600 font-medium">邮箱</span>
                    <span className="text-blue-800 font-semibold">{viewProfile.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-600 font-medium">昵称</span>
                    <span className="text-blue-800 font-semibold">{viewProfile.nickname || '未设置'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-600 font-medium">手机</span>
                    <span className="text-blue-800 font-semibold">{viewProfile.phone || '未设置'}</span>
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
                    <span className="text-blue-800 font-semibold">{viewProfile.location || '未设置'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-600 font-medium">网站</span>
                    <span className="text-blue-800 font-semibold">
                      {viewProfile.website ? (
                        <a 
                          href={viewProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-500 underline"
                        >
                          {viewProfile.website}
                        </a>
                      ) : (
                        '未设置'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-600 font-medium">注册时间</span>
                    <span className="text-blue-800 font-semibold">
                      {viewProfile.ctime ? new Date(viewProfile.ctime).toLocaleDateString('zh-CN') : '未知'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-blue-600 font-medium">最后更新</span>
                    <span className="text-blue-800 font-semibold">
                      {viewProfile.utime ? new Date(viewProfile.utime).toLocaleDateString('zh-CN') : '未知'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 文章管理 */}
        {activeTab === 'posts' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800">文章管理</h2>
              <button
                onClick={() => navigate('/create-post')}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white transition-all duration-200 font-medium shadow-lg"
              >
                创建新文章
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-blue-600">加载中...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-blue-600">暂无文章</p>
                <button
                  onClick={() => navigate('/create-post')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white transition-all duration-200 font-medium shadow-lg"
                >
                  创建第一篇文章
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white/60 rounded-2xl p-6 backdrop-blur-sm border border-white/50 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">{post.title}</h3>
                    <p className="text-blue-600 mb-4 line-clamp-2">{post.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-400">
                        {post.ctime ? new Date(post.ctime).toLocaleDateString('zh-CN') : '未知时间'}
                      </span>
                      <div className="space-x-2">
                        <button className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          编辑
                        </button>
                        <button className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 说说管理 */}
        {activeTab === 'status' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800">说说管理</h2>
              <button
                onClick={() => navigate('/create-status')}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white transition-all duration-200 font-medium shadow-lg"
              >
                发布新说说
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-blue-600">加载中...</p>
              </div>
            ) : statusList.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="mt-4 text-blue-600">暂无说说</p>
                <button
                  onClick={() => navigate('/create-status')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white transition-all duration-200 font-medium shadow-lg"
                >
                  发布第一条说说
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {statusList.map((status) => (
                  <div key={status.id} className="bg-white/60 rounded-2xl p-6 backdrop-blur-sm border border-white/50 hover:shadow-md transition-shadow">
                    <p className="text-blue-600 mb-4">{status.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-400">
                        {status.ctime ? new Date(status.ctime).toLocaleDateString('zh-CN') : '未知时间'}
                      </span>
                      <div className="space-x-2">
                        <button className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          编辑
                        </button>
                        <button className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 统计信息卡片 */}
        {activeTab === 'profile' && (
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
        )}
      </div>

      {/* 个人资料编辑面板 */}
      <ProfilePanel
        isVisible={showEditPanel}
        onClose={() => setShowEditPanel(false)}
        profileData={viewProfile}
        onSave={handleProfileSave}
      />
    </div>
  );
}