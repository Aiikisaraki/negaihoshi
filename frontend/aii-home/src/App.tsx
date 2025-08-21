import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { Navigation } from './components/ui/Navigation';
import { Timeline } from './components/feed/Timeline';
import { EditorPanel } from './components/feed/EditorPanel';
import { ProfilePage } from './pages/ProfilePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CreateStatusPage } from './pages/CreateStatusPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { StatusDetailPage } from './pages/StatusDetailPage';
import { Footer } from './components/ui/Footer';
import FloatingBackgroundSettings from './components/background/FloatingBackgroundSettings';
import apiClient, { APIResponse } from './requests/api';
// import { useToast } from './components/Toast';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

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
  const [currentTab, setCurrentTab] = useState<'home'>('home');
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
  // 移除未使用的 toast（AppContent 内不需要）

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

  // 若已登录但本地资料缺少 id，则拉取服务器资料以补全 id
  useEffect(() => {
    const ensureProfileId = async () => {
      if (!isLoggedIn) return;
      if ((profileData as { id?: number })?.id) return;
      try {
        const resp = await apiClient.get('/users/profile') as APIResponse<ProfileData & { id?: number }>;
        if (resp.code === 200 && resp.data) {
          setProfileData(resp.data);
          localStorage.setItem('userProfile', JSON.stringify(resp.data));
        }
      } catch {
        // 忽略：资料获取失败不影响继续渲染
      }
    };
    void ensureProfileId();
  }, [isLoggedIn, profileData]);

  // 若已登录但 localStorage 没有 userProfile，则拉取一次资料写入
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState === 'true' && !localStorage.getItem('userProfile')) {
      (async () => {
        try {
          const resp = await apiClient.get('/users/profile') as APIResponse<ProfileData & { id?: number }>;
          if (resp.code === 200 && resp.data) {
            setProfileData(resp.data);
            localStorage.setItem('userProfile', JSON.stringify(resp.data));
          }
        } catch {
          // 忽略：首次拉取资料失败
        }
      })();
    }
  }, [isLoggedIn]);

  // 根据当前路由设置标签页
  useEffect(() => {
    if (location.pathname === '/profile') {
      setCurrentTab('home'); // 重置标签页，因为个人中心现在是独立页面
    }
  }, [location.pathname]);

  // 首页浏览器标题
  useEffect(() => {
    if (location.pathname === '/') {
      document.title = '星の海の物語';
    }
  }, [location.pathname]);

  const handlePostSuccess = () => {
    // 触发时间线刷新
    setRefreshTrigger(prev => prev + 1);
  };

  // 已移除 onLoginSuccess 回调，登录成功后导航到登录页由 LoginPage 处理

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

  // 已移除 onProfileClick，用户菜单直接使用链接跳转

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-200 via-blue-200 via-cyan-200 to-blue-300">
        {/* 整合后的导航栏 - 包含登录状态显示区域 */}
        <Navigation 
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          userProfile={isLoggedIn ? profileData : undefined}
        />
        
        {/* 主内容区域 - 合并后的毛玻璃卡片效果 */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="main-content-glass rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl w-full max-w-7xl">
            {/* 标题和标签页区域 */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
              <div></div> {/* 保留空div以保持布局结构 */}
              <div className="flex items-center gap-3">
                {/* 保留空位，避免布局抖动 */}
              </div>
            </div>

            {/* 内容区域 */}
            {currentTab === 'home' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* 主体：文章列表（2列宽） */}
                <div className="lg:col-span-2 space-y-6">
                  <HomePostsSection isLoggedIn={isLoggedIn} />
                </div>

                {/* 右侧栏：树洞与发布树洞 */}
                <div className="lg:col-span-1 space-y-6">
                  <Section title="树洞">
                    <Timeline refreshTrigger={refreshTrigger} />
                  </Section>
                  <Section title="发布树洞">
                    <EditorPanel onPostSuccess={handlePostSuccess} />
                  </Section>
                </div>
              </div>
            ) : null}
          </div>
        </main>

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
      // 更新服务器上的个人资料，优先使用后端返回的最新数据
      const response = await apiClient.put('/users/profile', data) as APIResponse<ProfileData>;
      
      if (response.code === 200) {
        const latest = response.data ?? data;
        setProfileData(latest);
        localStorage.setItem('userProfile', JSON.stringify(latest));
        // toast.show('个人资料更新成功', { type: 'success' }); // 移除未使用的 toast
      } else {
        throw new Error(response.message || '更新失败');
      }
    } catch (error: unknown) {
      console.error('更新个人资料失败:', error);
      /* noop */
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-200 via-blue-200 via-cyan-200 to-blue-300">
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/profile" 
            element={
              isLoggedIn ? (
                <ProfilePage 
                  profileData={profileData}
                  onProfileUpdate={handleProfileUpdate}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-blue-800 mb-4">请先登录</h1>
                    <p className="text-blue-600 mb-6">登录后即可查看和编辑个人资料</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-all duration-200"
                    >
                      返回首页
                    </button>
                  </div>
                </div>
              )
            } 
          />
          <Route
            path="/profile/:id"
            element={
              <ProfilePage
                profileData={profileData}
                onProfileUpdate={handleProfileUpdate}
              />
            }
          />
          <Route 
            path="/create-post" 
            element={
              isLoggedIn ? (
                <CreatePostPage />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-blue-800 mb-4">请先登录</h1>
                    <p className="text-blue-600 mb-6">登录后即可创建文章</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-all duration-200"
                    >
                      返回首页
                    </button>
                  </div>
                </div>
              )
            } 
          />
          <Route 
            path="/create-status" 
            element={
              isLoggedIn ? (
                <CreateStatusPage />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-blue-800 mb-4">请先登录</h1>
                    <p className="text-blue-600 mb-6">登录后即可发布说说</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-all duration-200"
                    >
                      返回首页
                    </button>
                  </div>
                </div>
              )
            } 
          />
          <Route 
            path="/post/:id" 
            element={<PostDetailPage />} 
          />
          <Route 
            path="/status/:id" 
            element={<StatusDetailPage />} 
          />
        </Routes>
        
        {/* 页脚组件 - 在所有路由下都显示 */}
        <Footer 
          copyrightYear={new Date().getFullYear()}
          copyrightName="星の海の物語"
          recordNumber="粤ICP备XXXXXXXX号"
        />
        
        {/* 可拖动的背景设置悬浮球 */}
        <FloatingBackgroundSettings />
      </div>
    </Router>
  );
}

type PostListItem = { id: number; title: string; content: string; userId: number; ctime?: string };
// 首页文章列表
function HomePostsSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [likeCount, setLikeCount] = useState<Record<number, number>>({});
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [busy, setBusy] = useState<Record<number, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, Array<{ id: number; content: string; user_id: number; ctime: number }>>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await apiClient.get('/posts/listAll?isPost=true') as APIResponse<PostListItem[] | { posts?: PostListItem[] } >;
        if (resp.code === 200) {
          const raw = Array.isArray(resp.data)
            ? (resp.data as Array<Record<string, unknown>>)
            : ((resp.data as { posts?: Array<Record<string, unknown>> }).posts || []);
          const normalized: PostListItem[] = raw
            .map((p: Record<string, unknown>) => {
              const id = (p.id as number | undefined) ?? (p.Id as number | undefined);
              const userId = (p.userId as number | undefined) ?? (p.UserId as number | undefined);
              if (!id || !userId) return undefined;
              const title = (p.title as string | undefined) ?? (p.Title as string | undefined) ?? '';
              const content = (p.content as string | undefined) ?? (p.Content as string | undefined) ?? '';
              const ctime = (p.ctime as string | undefined) ?? (p.Ctime as string | undefined);
              return { id, userId, title, content, ctime } as PostListItem;
            })
            .filter((v): v is PostListItem => v !== undefined);
          setPosts(normalized);
          // 拉取点赞计数与状态
          const ids = normalized.map(p => p.id);
          const { interactApi } = await import('./requests/interact');
          const counts = await Promise.all(
            ids.map((id: number) => interactApi.likeCount(id, true))
          ).catch(() => [] as Array<{ code?: number; data?: { count?: number } }>);
          const likedResp = await Promise.all(
            ids.map((id: number) => interactApi.isLiked(id, true).catch(() => ({ code: 401, data: { liked: false } } as { code: number; data: { liked: boolean } })))
          );
          const countMap: Record<number, number> = {};
          const likedMap: Record<number, boolean> = {};
          ids.forEach((id: number, idx: number) => {
            const c = counts[idx] as { code?: number; data?: { count?: number } } | undefined;
            const l = likedResp[idx] as { code?: number; data?: { liked?: boolean } } | undefined;
            countMap[id] = (c && c.code === 200 && c.data && typeof c.data.count === 'number') ? c.data.count : 0;
            likedMap[id] = !!(l && l.code === 200 && l.data && l.data.liked);
          });
          setLikeCount(countMap);
          setLiked(likedMap);
          setError('');
        } else {
          setError(resp.message || '加载失败');
        }
      } catch { /* noop */ }
      finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleLike = async (pid: number) => {
    if (busy[pid]) return;
    setBusy(prev => ({ ...prev, [pid]: true }));
    try {
      const { interactApi } = await import('./requests/interact');
      if (liked[pid]) {
        const r = await interactApi.unlike(pid, true);
        if (r.code === 200) {
          setLiked(prev => ({ ...prev, [pid]: false }));
          setLikeCount(prev => ({ ...prev, [pid]: r.data.count ?? Math.max(0, (prev[pid] || 1) - 1) }));
        }
      } else {
        const r = await interactApi.like(pid, true);
        if (r.code === 200) {
          setLiked(prev => ({ ...prev, [pid]: true }));
          setLikeCount(prev => ({ ...prev, [pid]: r.data.count ?? (prev[pid] || 0) + 1 }));
        }
      }
    } catch { /* noop */ }
    finally {
      setBusy(prev => ({ ...prev, [pid]: false }));
    }
  };

  const toggleComments = async (pid: number) => {
    const opened = openComments[pid];
    const next = { ...openComments, [pid]: !opened };
    setOpenComments(next);
    if (!opened) {
      try {
        const { interactApi } = await import('./requests/interact');
        const resp = await interactApi.listComments(pid, true, 1, 10);
        if (resp.code === 200) {
          const items = (resp.data.comments || []) as Array<{ id: number; content: string; user_id: number; ctime: number }>;
          setComments(prev => ({ ...prev, [pid]: items.map(i => ({ id: i.id, content: i.content, user_id: i.user_id, ctime: i.ctime })) }));
        }
      } catch { /* noop */ }
    }
  };

  const sendComment = async (pid: number) => {
    const text = (commentText[pid] || '').trim();
    if (!text) return;
    try {
      const { interactApi } = await import('./requests/interact');
      await interactApi.addComment(pid, true, text);
      const resp = await interactApi.listComments(pid, true, 1, 10);
      if (resp.code === 200) {
        const items = (resp.data.comments || []) as Array<{ id: number; content: string; user_id: number; ctime: number }>;
        setComments(prev => ({ ...prev, [pid]: items.map(i => ({ id: i.id, content: i.content, user_id: i.user_id, ctime: i.ctime })) }));
      }
      setCommentText(prev => ({ ...prev, [pid]: '' }));
    } catch { /* noop */ }
  };

  return (
    <Section title="文章精选">
      {loading ? (
        <div className="text-blue-700">加载中...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-blue-700">暂无文章</div>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <a key={p.id} href={`/post/${p.id}`} className="block bg-white/40 backdrop-blur-sm rounded-xl p-4 hover:bg-white/50 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-blue-800/90">{p.title || '无标题'}</h3>
                <span className="text-sm text-blue-600">{p.ctime ? new Date(p.ctime).toLocaleDateString('zh-CN') : ''}</span>
              </div>
              <p className="text-blue-700/80 line-clamp-3 whitespace-pre-wrap">{p.content}</p>
              <div className="mt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); toggleLike(p.id); }}
                  disabled={!!busy[p.id]}
                  title={liked[p.id] ? '取消点赞' : '点赞'}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg ${liked[p.id] ? 'bg-red-500/80 text-white' : 'bg-white/50 text-blue-700 hover:bg-white/70'} disabled:opacity-50`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${liked[p.id] ? '' : 'text-red-500'}`}>
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.462 2.25 9a4.5 4.5 0 018.159-2.606.75.75 0 001.282 0A4.5 4.5 0 0119.85 9c0 3.462-2.438 6.36-4.739 8.507a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.698 0l-.003-.002z" />
                  </svg>
                  <span>{likeCount[p.id] || 0}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); toggleComments(p.id); }}
                  className="px-3 py-1 rounded-lg bg-purple-500/70 text-white hover:bg-purple-600/80"
                >
                  评论
                </button>
              </div>
              {openComments[p.id] && (
                <div className="mt-3 pt-3 border-t border-blue-100/30">
                  {!isLoggedIn ? (
                    <div className="text-blue-700">
                      登录后才可以发表评论哦，
                      <Link to="/login" className="underline text-blue-600 hover:text-blue-700">登录</Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-3">
                        {(comments[p.id] || []).length === 0 ? (
                          <div className="text-blue-600">暂无评论</div>
                        ) : (
                          (comments[p.id] || []).map(c => (
                            <div key={c.id} className="p-3 rounded-xl bg-white/60">
                              <div className="text-sm text-blue-500 mb-1">用户 {c.user_id}</div>
                              <div className="text-blue-800 whitespace-pre-wrap">{c.content}</div>
                            </div>
                          ))
                        )}
                        <div className="p-2">
                          <a href={`/post/${p.id}`} className="text-blue-600 hover:text-blue-700 underline">查看更多评论</a>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          value={commentText[p.id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder="写下你的评论..."
                          className="flex-1 p-3 rounded-xl bg-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 min-h-[60px]"
                        />
                        <button onClick={(e) => { e.preventDefault(); sendComment(p.id); }} disabled={!((commentText[p.id] || '').trim())} className="px-4 h-[42px] self-end rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50">发送</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </Section>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-5 sm:p-7 rounded-xl bg-white/10 backdrop-blur-sm shadow-md">
    <h2 className="text-2xl font-semibold text-blue-800/90 mb-5">{title}</h2>
    {children}
  </div>
);