import { useEffect, useState } from 'react';
import { userApi } from '../requests/posts';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ProfilePanel } from '../components/ProfilePanel';
import apiClient from '../requests/api';
import AvatarImage from '../components/AvatarImage';
import { interactApi } from '../requests/interact';
import { useToast } from '../components/Toast';

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
  const params = useParams();
  const routeUserId = params.id ? parseInt(params.id, 10) : undefined;
  const location = useLocation();
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [viewProfile, setViewProfile] = useState<ProfileData>(profileData);
  const [activeTab, setActiveTab] = useState<'posts' | 'status'>('posts');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [statusList, setStatusList] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [totalLikesReceived, setTotalLikesReceived] = useState<number>(0);
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(profileData.id);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const toast = useToast();

  const isOwner = !routeUserId || (currentUserId !== undefined && routeUserId === currentUserId);

  // 识别当前登录用户ID：优先 localStorage.userProfile.id，其次 props.profileData.id
  useEffect(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.id === 'number') {
          setCurrentUserId(parsed.id);
          setIsLoggedIn(true);
          return;
        }
      }
    } catch {}
    if (profileData?.id && typeof profileData.id === 'number') {
      setCurrentUserId(profileData.id);
    }
    // 检查登录状态
    try {
      const loginStatus = localStorage.getItem('isLoggedIn');
      setIsLoggedIn(loginStatus === 'true');
    } catch {}
  }, [profileData.id]);

  // 路由变化时重置状态，避免显示旧用户的数据
  useEffect(() => {
    setActiveTab('posts');
    setPosts([]);
    setStatusList([]);
  }, [routeUserId]);

  // 更新浏览器标题：{昵称或用户名}的个人中心——站点名
  useEffect(() => {
    const siteName = '星の海の物語';
    const displayName = viewProfile.nickname || viewProfile.username || '个人中心';
    document.title = `${displayName}的个人中心 —— ${siteName}`;
  }, [viewProfile.nickname, viewProfile.username]);

  // 每篇文章点赞状态与计数
  const [postLikeCount, setPostLikeCount] = useState<Record<number, number>>({});
  const [postLiked, setPostLiked] = useState<Record<number, boolean>>({});
  const [likingPost, setLikingPost] = useState<Record<number, boolean>>({});

  // 文章评论
  const [postOpenComments, setPostOpenComments] = useState<Record<number, boolean>>({});
  const [postComments, setPostComments] = useState<Record<number, Array<{ id: number; content: string; user_id: number; ctime: number }>>>({});
  const [postCommentText, setPostCommentText] = useState<Record<number, string>>({});

  // 每条说说点赞状态与计数
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [statusComments, setStatusComments] = useState<Record<number, Array<{ id: number; content: string; user_id: number; ctime: number }>>>({});
  const [statusCommentText, setStatusCommentText] = useState<Record<number, string>>({});
  const [statusLikeCount, setStatusLikeCount] = useState<Record<number, number>>({});
  const [statusLiked, setStatusLiked] = useState<Record<number, boolean>>({});
  const [likingStatus, setLikingStatus] = useState<Record<number, boolean>>({});

  // 当路由变化或登录用户资料变化时，决定展示哪个用户的资料
  useEffect(() => {
    const isIncomplete = (p: ProfileData | undefined) => {
      if (!p) return true;
      const keys: Array<keyof ProfileData> = ['username', 'email'];
      return keys.some(k => !p[k] || String(p[k] || '').trim() === '');
    };
    (async () => {
      try {
        // 若是本人，且已登录，始终从 /users/profile 拉取最新
        if (isLoggedIn && currentUserId && routeUserId === currentUserId) {
          const self = await userApi.getProfile();
          if (self.code === 200 && self.data) {
            const latest = self.data as unknown as ProfileData;
            setViewProfile(latest);
            try { localStorage.setItem('userProfile', JSON.stringify(latest)); } catch {}
            return;
          } else {
            // 401 或其他错误时退回公开资料
            if (routeUserId) {
              const pub = await userApi.getProfileById(routeUserId);
              if (pub.code === 200 && pub.data) {
                setViewProfile(pub.data as ProfileData);
              }
            }
            // 清理本地登录标记，避免后续继续误判
            try { localStorage.removeItem('isLoggedIn'); } catch {}
          }
        }
        // 他人资料或无法判定本人：按路由ID拉取（公开）
        if (routeUserId) {
          const resp = await userApi.getProfileById(routeUserId);
          if (resp.code === 200 && resp.data) {
            setViewProfile(resp.data as ProfileData);
            return;
          }
        }
        // 回退：使用传入的 profileData；若不完整且已登录再尝试拉取本人资料
        setViewProfile(profileData);
        if (isLoggedIn && isIncomplete(profileData)) {
          const self = await userApi.getProfile();
          if (self.code === 200 && self.data) {
            const latest = self.data as unknown as ProfileData;
            setViewProfile(latest);
            try { localStorage.setItem('userProfile', JSON.stringify(latest)); } catch {}
          }
        }
      } catch (e) {
        // 发生异常（例如401），尝试公开资料兜底
        try {
          if (routeUserId) {
            const pub = await userApi.getProfileById(routeUserId);
            if (pub.code === 200 && pub.data) {
              setViewProfile(pub.data as ProfileData);
            }
          }
        } catch {}
        console.debug('加载用户资料失败', e);
      }
    })();
  }, [routeUserId, currentUserId, profileData.id, isLoggedIn]);

  // ?edit=1 时打开编辑面板（仅自己）
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === '1' && (!routeUserId || routeUserId === profileData.id)) {
      setShowEditPanel(true);
    }
  }, [location.search, routeUserId, profileData.id]);

  // 初次加载或头像缺失时，主动拉取最新头像地址（仅自己）
  useEffect(() => {
    if (!isOwner) return;
    if (!viewProfile.avatar) {
      (async () => {
        try {
          const resp = await userApi.getAvatar();
          if (resp.code === 200 && resp.data?.avatar_url) {
            setViewProfile(prev => ({ ...prev, avatar: resp.data!.avatar_url }));
          }
        } catch (e) {
          console.debug('获取头像失败', e);
        }
      })();
    }
  }, [isOwner, viewProfile.avatar]);

  // 编辑面板关闭后，拉取一次头像，确保页面头像最新（仅自己）
  useEffect(() => {
    if (!isOwner) return;
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
  }, [isOwner, showEditPanel]);

  // 关注/粉丝数
  useEffect(() => {
    (async () => {
      if (!viewProfile.id) return;
      try {
        const [followingResp, followersResp] = await Promise.all([
          interactApi.countFollowing(viewProfile.id),
          interactApi.countFollowers(viewProfile.id),
        ]);
        if (followingResp.code === 200) setFollowingCount(followingResp.data.count || 0);
        if (followersResp.code === 200) setFollowersCount(followersResp.data.count || 0);
      } catch {}
    })();
  }, [viewProfile.id]);

  // 检查关注状态（仅查看他人资料时）
  useEffect(() => {
    (async () => {
      if (!viewProfile.id || isOwner || !currentUserId || !isLoggedIn) return;
      try {
        const resp = await interactApi.isFollowing(viewProfile.id);
        if (resp.code === 200) {
          setIsFollowing(resp.data.following);
        }
      } catch (e) {
        console.debug('检查关注状态失败', e);
      }
    })();
  }, [viewProfile.id, isOwner, currentUserId, isLoggedIn]);

  // 获取用户的文章列表
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const resp: any = await apiClient.get('/posts/listAll?isPost=true');
      if (resp.code === 200) {
        const raw = Array.isArray(resp.data) ? resp.data : (resp.data.posts || []);
        const normalized = raw.map((p: any) => ({
          id: p.id ?? p.Id,
          title: p.title ?? p.Title ?? '',
          content: p.content ?? p.Content ?? '',
          userId: p.userId ?? p.UserId,
          ctime: p.ctime ?? p.Ctime,
          utime: p.utime ?? p.Utime,
        }));
        const userPosts = normalized.filter((post: any) => post.userId === viewProfile.id);
        setPosts(userPosts);
        // 拉取点赞计数与状态（仅在查看他人时有意义，但本地缓存不影响）
        const ids = userPosts.map((p: PostItem) => p.id);
        const [counts, liked] = await Promise.all([
          Promise.all(ids.map((id: number) => interactApi.likeCount(id, true).catch(() => ({ code: 500, data: { count: 0 } } as any)))) ,
          isLoggedIn ? Promise.all(ids.map((id: number) => interactApi.isLiked(id, true).catch(() => ({ code: 401, data: { liked: false } } as any)))) : Promise.resolve(ids.map(() => ({ code: 401, data: { liked: false } } as any)))
        ]);
        const countMap: Record<number, number> = {};
        const likedMap: Record<number, boolean> = {};
        ids.forEach((id: number, idx: number) => {
          countMap[id] = (counts[idx].code === 200 && (counts[idx].data as any)?.count) ? (counts[idx].data as any).count : 0;
          likedMap[id] = (liked[idx].code === 200 && (liked[idx].data as any)?.liked) ? true : false;
        });
        setPostLikeCount(countMap);
        setPostLiked(likedMap);
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
        const raw = Array.isArray(resp.data) ? resp.data : (resp.data.status || []);
        const normalized = raw.map((s: any) => ({
          id: s.id ?? s.Id,
          content: s.content ?? s.Content ?? '',
          userId: s.userId ?? s.UserId,
          ctime: s.ctime ?? s.Ctime,
          utime: s.utime ?? s.Utime,
        }));
        const userStatus = normalized.filter((status: any) => status.userId === viewProfile.id);
        setStatusList(userStatus);
        // 拉取点赞计数与状态
        const ids = userStatus.map((s: StatusItem) => s.id);
        const [counts, liked] = await Promise.all([
          Promise.all(ids.map((id: number) => interactApi.likeCount(id, false).catch(() => ({ code: 500, data: { count: 0 } } as any)))),
          isLoggedIn ? Promise.all(ids.map((id: number) => interactApi.isLiked(id, false).catch(() => ({ code: 401, data: { liked: false } } as any)))) : Promise.resolve(ids.map(() => ({ code: 401, data: { liked: false } } as any)))
        ]);
        const countMap: Record<number, number> = {};
        const likedMap: Record<number, boolean> = {};
        ids.forEach((id: number, idx: number) => {
          countMap[id] = (counts[idx].code === 200 && (counts[idx].data as any)?.count) ? (counts[idx].data as any).count : 0;
          likedMap[id] = (liked[idx].code === 200 && (liked[idx].data as any)?.liked) ? true : false;
        });
        setStatusLikeCount(countMap);
        setStatusLiked(likedMap);
      }
    } catch (error) {
      console.error('获取说说列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换标签页时加载对应数据
  useEffect(() => {
    if (!viewProfile.id) return;
    if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'status') {
      fetchStatus();
    }
  }, [activeTab, viewProfile.id]);

  // 计算被点赞总数（文章 + 说说）
  useEffect(() => {
    (async () => {
      if (!viewProfile.id) return;
      try {
        const postLikes = await Promise.all(posts.map(p => interactApi.likeCount(p.id, true)));
        const statusLikes = await Promise.all(statusList.map(s => interactApi.likeCount(s.id, false)));
        const sum = postLikes.reduce((acc, r) => acc + ((r.code === 200 && r.data && (r.data as any).count) ? (r.data as any).count : 0), 0)
          + statusLikes.reduce((acc, r) => acc + ((r.code === 200 && r.data && (r.data as any).count) ? (r.data as any).count : 0), 0);
        setTotalLikesReceived(sum);
      } catch (e) {
        console.debug('计算被点赞数失败', e);
      }
    })();
  }, [posts, statusList, viewProfile.id]);

  const handleProfileSave = async (data: ProfileData) => {
    try {
      onProfileUpdate(data);
      setViewProfile(data);
      setShowEditPanel(false);
    } catch (error) {
      console.error('更新个人资料失败:', error);
    }
  };

  // 打开/刷新说说评论
  const toggleComments = async (sid: number) => {
    const opened = openComments[sid];
    const next = { ...openComments, [sid]: !opened };
    setOpenComments(next);
    if (!opened) {
      try {
        const [likeResp, likedResp, commentsResp] = await Promise.all([
          interactApi.likeCount(sid, false),
          interactApi.isLiked(sid, false).catch(() => ({ code: 401, data: { liked: false } } as any)),
          interactApi.listComments(sid, false, 1, 10)
        ]);
        if (likeResp.code === 200) setStatusLikeCount(prev => ({ ...prev, [sid]: (likeResp.data as any).count || 0 }));
        if (likedResp.code === 200) setStatusLiked(prev => ({ ...prev, [sid]: !!(likedResp.data as any)?.liked }));
        if (commentsResp.code === 200) {
          const items = (commentsResp.data.comments || []) as any[];
          setStatusComments(prev => ({ ...prev, [sid]: items.map(i => ({ id: i.id, content: i.content, user_id: i.user_id, ctime: i.ctime })) }));
        }
      } catch (e) { console.debug('加载说说互动失败', e); }
    }
  };

  // 打开/刷新文章评论
  const togglePostComments = async (pid: number) => {
    const opened = postOpenComments[pid];
    const next = { ...postOpenComments, [pid]: !opened };
    setPostOpenComments(next);
    if (!opened) {
      try {
        const [likeResp, likedResp, commentsResp] = await Promise.all([
          interactApi.likeCount(pid, true),
          interactApi.isLiked(pid, true).catch(() => ({ code: 401, data: { liked: false } } as any)),
          interactApi.listComments(pid, true, 1, 10)
        ]);
        if (likeResp.code === 200) setPostLikeCount(prev => ({ ...prev, [pid]: (likeResp.data as any).count || 0 }));
        if (likedResp.code === 200) setPostLiked(prev => ({ ...prev, [pid]: !!(likedResp.data as any)?.liked }));
        if (commentsResp.code === 200) {
          const items = (commentsResp.data.comments || []) as any[];
          setPostComments(prev => ({ ...prev, [pid]: items.map(i => ({ id: i.id, content: i.content, user_id: i.user_id, ctime: i.ctime })) }));
        }
      } catch (e) { console.debug('加载文章互动失败', e); }
    }
  };

  // 点赞/取消点赞 - 说说（仅他人）
  const toggleLikeStatus = async (sid: number) => {
    if (isOwner) return;
    if (likingStatus[sid]) return;
    setLikingStatus(prev => ({ ...prev, [sid]: true }));
    try {
      if (statusLiked[sid]) {
        const r = await interactApi.unlike(sid, false);
        if (r.code === 200) {
          setStatusLiked(prev => ({ ...prev, [sid]: false }));
          setStatusLikeCount(prev => ({ ...prev, [sid]: r.data.count ?? Math.max(0, (prev[sid] || 1) - 1) }));
        }
      } else {
        const r = await interactApi.like(sid, false);
        if (r.code === 200) {
          setStatusLiked(prev => ({ ...prev, [sid]: true }));
          setStatusLikeCount(prev => ({ ...prev, [sid]: r.data.count ?? (prev[sid] || 0) + 1 }));
        }
      }
    } catch (e) { console.debug('点赞切换失败', e); }
    finally { setLikingStatus(prev => ({ ...prev, [sid]: false })); }
  };

  // 点赞/取消点赞 - 文章（仅他人）
  const toggleLikePost = async (pid: number) => {
    if (isOwner) return;
    if (likingPost[pid]) return;
    setLikingPost(prev => ({ ...prev, [pid]: true }));
    try {
      if (postLiked[pid]) {
        const r = await interactApi.unlike(pid, true);
        if (r.code === 200) {
          setPostLiked(prev => ({ ...prev, [pid]: false }));
          setPostLikeCount(prev => ({ ...prev, [pid]: r.data.count ?? Math.max(0, (prev[pid] || 1) - 1) }));
        }
      } else {
        const r = await interactApi.like(pid, true);
        if (r.code === 200) {
          setPostLiked(prev => ({ ...prev, [pid]: true }));
          setPostLikeCount(prev => ({ ...prev, [pid]: r.data.count ?? (prev[pid] || 0) + 1 }));
        }
      }
    } catch (e) { console.debug('文章点赞切换失败', e); }
    finally { setLikingPost(prev => ({ ...prev, [pid]: false })); }
  };

  const sendStatusComment = async (sid: number) => {
    const text = (statusCommentText[sid] || '').trim();
    if (!text) return;
    try {
      await interactApi.addComment(sid, false, text);
      const commentsResp = await interactApi.listComments(sid, false, 1, 10);
      if (commentsResp.code === 200) {
        const items = (commentsResp.data.comments || []) as any[];
        setStatusComments(prev => ({ ...prev, [sid]: items.map(i => ({ id: i.id, content: i.content, user_id: i.user_id, ctime: i.ctime })) }));
      }
      setStatusCommentText(prev => ({ ...prev, [sid]: '' }));
    } catch (e) { console.debug('评论失败', e); }
  };

  const sendPostComment = async (pid: number) => {
    const text = (postCommentText[pid] || '').trim();
    if (!text) return;
    try {
      await interactApi.addComment(pid, true, text);
      const commentsResp = await interactApi.listComments(pid, true, 1, 10);
      if (commentsResp.code === 200) {
        const items = (commentsResp.data.comments || []) as any[];
        setPostComments(prev => ({ ...prev, [pid]: items.map(i => ({ id: i.id, content: i.content, user_id: i.user_id, ctime: i.ctime })) }));
      }
      setPostCommentText(prev => ({ ...prev, [pid]: '' }));
    } catch (e) { console.debug('评论失败', e); }
  };

  // 删除文章/说说（仅自己）
  const deletePost = async (pid: number) => {
    if (!isOwner) return;
    try {
      const resp: any = await apiClient.delete(`/posts/delete/${pid}`, { data: { id: pid, isPost: true } });
      if (resp.code === 200 || typeof resp === 'string' || resp?.message) {
        toast.show('删除文章成功', { type: 'success' });
        fetchPosts();
      } else {
        toast.show('删除文章失败', { type: 'error' });
      }
    } catch (e) {
      toast.show('删除文章失败', { type: 'error' });
    }
  };
  const deleteStatus = async (sid: number) => {
    if (!isOwner) return;
    try {
      const resp: any = await apiClient.delete(`/posts/delete/${sid}`, { data: { id: sid, isPost: false } });
      if (resp.code === 200 || typeof resp === 'string' || resp?.message) {
        toast.show('删除说说成功', { type: 'success' });
        fetchStatus();
      } else {
        toast.show('删除说说失败', { type: 'error' });
      }
    } catch (e) {
      toast.show('删除说说失败', { type: 'error' });
    }
  };

  // 切换关注状态
  const toggleFollow = async (uid: number) => {
    if (!uid || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await interactApi.unfollow(uid);
        setIsFollowing(false);
      } else {
        await interactApi.follow(uid);
        setIsFollowing(true);
      }
      // 更新关注/粉丝数
      if (viewProfile.id) {
        const [followingResp, followersResp] = await Promise.all([
          interactApi.countFollowing(viewProfile.id),
          interactApi.countFollowers(viewProfile.id),
        ]);
        if (followingResp.code === 200) setFollowingCount(followingResp.data.count || 0);
        if (followersResp.code === 200) setFollowersCount(followersResp.data.count || 0);
      }
    } catch (e) { 
      console.debug('关注操作失败', e); 
    } finally {
      setFollowLoading(false);
    }
  };

  const dynamicsCount = posts.length + statusList.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
      {/* 顶部导航栏 */}
      <div className="w-full bg-white/70 backdrop-blur-md border-b border-white/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-blue-800">个人中心</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700 transition-colors">返回首页</Link>
        </div>
      </div>

      <div className="w-full max-w-6xl p-4 mx-auto">
        {/* 顶部标签（右侧主体区的切换） */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/40 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'posts'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
            >
              文章
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'status'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
            >
              说说
            </button>
          </div>
        </div>

        {/* 主体两栏布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧侧边栏：基本信息 + 其他信息 + 统计 + 操作 */}
          <div className="space-y-6 md:col-span-1">
            <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-xl border border-white/40">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-200 shadow">
                  <AvatarImage src={viewProfile.avatar} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-800">{viewProfile.nickname || viewProfile.username}</div>
                  <div className="text-sm text-blue-600">{viewProfile.email}</div>
                </div>
              </div>
              {isOwner ? (
                <button onClick={() => setShowEditPanel(true)} className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700">编辑个人信息</button>
              ) : !isLoggedIn ? (
                <div className="text-center">
                  <div className="text-blue-600 mb-2">登录后可以关注用户</div>
                  <Link to="/login" className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 block">去登录</Link>
                </div>
              ) : (
                <button 
                  onClick={() => toggleFollow(viewProfile.id!)} 
                  disabled={followLoading}
                  className={`w-full px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 ${
                    isFollowing 
                      ? 'bg-gray-500 text-white hover:bg-gray-600' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {followLoading ? '处理中...' : (isFollowing ? '取消关注' : '关注')}
                </button>
              )}
              {/* 统计 */}
              <div className="mt-5 grid grid-cols-4 gap-3">
                <div className="bg-white border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-500">动态</div>
                  <div className="text-xl font-bold text-blue-800">{dynamicsCount}</div>
                </div>
                <div className="bg-white border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-500">被点赞</div>
                  <div className="text-xl font-bold text-blue-800">{totalLikesReceived}</div>
                </div>
                <div className="bg-white border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-500">粉丝</div>
                  <div className="text-xl font-bold text-blue-800">{followersCount}</div>
                </div>
                <div className="bg-white border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-500">关注</div>
                  <div className="text-xl font-bold text-blue-800">{followingCount}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-xl border border-white/40">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">基本信息</h3>
              <div className="space-y-3 text-blue-800">
                <div className="flex justify-between"><span className="text-blue-600">用户名</span><span className="font-semibold">{viewProfile.username}</span></div>
                <div className="flex justify-between"><span className="text-blue-600">昵称</span><span className="font-semibold">{viewProfile.nickname || '未设置'}</span></div>
                <div className="flex justify-between"><span className="text-blue-600">邮箱</span><span className="font-semibold">{viewProfile.email}</span></div>
                <div className="flex justify-between"><span className="text-blue-600">手机</span><span className="font-semibold">{viewProfile.phone || '未设置'}</span></div>
              </div>
            </div>

            <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-xl border border-white/40">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">其他信息</h3>
              <div className="space-y-3 text-blue-800">
                <div className="flex justify-between"><span className="text-blue-600">位置</span><span className="font-semibold">{viewProfile.location || '未设置'}</span></div>
                <div className="flex justify-between"><span className="text-blue-600">网站</span><span className="font-semibold">{viewProfile.website || '未设置'}</span></div>
              </div>
            </div>
          </div>

          {/* 右侧主体：文章或说说列表 */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'posts' && (
              <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-xl border border-white/40">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800">文章</h2>
                  {isOwner && (
                    <button onClick={() => navigate('/create-post')} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700">创建文章</button>
                  )}
                </div>
                {loading ? (
                  <div className="text-center py-6">加载中...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-6">暂无文章</div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-white rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-blue-800">{post.title}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            {isOwner ? (
                              <>
                                <button onClick={() => navigate(`/create-post?edit=1&id=${post.id}`)} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600">编辑</button>
                                <button onClick={() => deletePost(post.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">删除</button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => toggleLikePost(post.id)}
                                  disabled={!!likingPost[post.id]}
                                  title={postLiked[post.id] ? '取消点赞' : '点赞'}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${postLiked[post.id] ? 'bg-red-500 text-white border-red-500' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'} disabled:opacity-50`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${postLiked[post.id] ? '' : 'text-red-500'}`}>
                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.462 2.25 9a4.5 4.5 0 018.159-2.606.75.75 0 001.282 0A4.5 4.5 0 0119.85 9c0 3.462-2.438 6.36-4.739 8.507a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.698 0l-.003-.002z" />
                                  </svg>
                                  <span>{postLikeCount[post.id] || 0}</span>
                                </button>
                                <button onClick={() => togglePostComments(post.id)} className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600">评论</button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-blue-700 line-clamp-3">{post.content}</p>
                        {postOpenComments[post.id] && (
                          <div className="mt-3 border-t border-blue-100 pt-3">
                            {!isLoggedIn ? (
                              <div className="text-blue-700">
                                登录后才可以发表评论哦，
                                <Link to="/login" className="underline text-blue-600 hover:text-blue-700">登录</Link>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-2 mb-3">
                                  {(postComments[post.id] || []).length === 0 ? (
                                    <div className="text-blue-600">暂无评论</div>
                                  ) : (
                                    (postComments[post.id] || []).map(c => (
                                      <div key={c.id} className="p-3 rounded-xl bg-white border border-blue-100">
                                        <div className="text-sm text-blue-500 mb-1">用户 {c.user_id}</div>
                                        <div className="text-blue-800 whitespace-pre-wrap">{c.content}</div>
                                      </div>
                                    ))
                                  )}
                                  <div className="p-2">
                                    <Link to={`/post/${post.id}`} className="text-blue-600 hover:text-blue-700 underline">查看更多评论</Link>
                                  </div>
                                </div>
                                {!isOwner && (
                                  <div className="flex gap-2">
                                    <textarea
                                      value={postCommentText[post.id] || ''}
                                      onChange={(e) => setPostCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      placeholder="写下你的评论..."
                                      className="flex-1 p-3 rounded-xl bg-white border border-blue-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 min-h-[60px]"
                                    />
                                    <button onClick={() => sendPostComment(post.id)} disabled={!((postCommentText[post.id] || '').trim())} className="px-4 h-[42px] self-end rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50">发送</button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'status' && (
              <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-xl border border-white/40">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800">说说</h2>
                  {isOwner && (
                    <button onClick={() => navigate('/create-status')} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700">发布说说</button>
                  )}
                </div>
                {loading ? (
                  <div className="text-center py-6">加载中...</div>
                ) : statusList.length === 0 ? (
                  <div className="text-center py-6">暂无说说</div>
                ) : (
                  <div className="space-y-4">
                    {statusList.map((s) => (
                      <div key={s.id} className="bg-white rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-blue-400">{s.ctime ? new Date(s.ctime).toLocaleDateString('zh-CN') : ''}</div>
                          <div className="space-x-2 flex items-center">
                            {isOwner ? (
                              <>
                                <button onClick={() => navigate(`/create-status?edit=1&id=${s.id}`)} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">编辑</button>
                                <button onClick={() => deleteStatus(s.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">删除</button>
                              </>
                            ) : (
                              <>
                                <span className="text-blue-700">点赞 {statusLikeCount[s.id] || 0}</span>
                                <button onClick={() => toggleLikeStatus(s.id)} disabled={!!likingStatus[s.id]} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm disabled:opacity-50">{statusLiked[s.id] ? '已赞' : '点赞'}</button>
                                <button onClick={() => toggleComments(s.id)} className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm">评论</button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-blue-600 mb-3 whitespace-pre-wrap">{s.content}</p>
                        {openComments[s.id] && (
                          <div className="mt-3 border-t border-blue-100 pt-3">
                            {!isLoggedIn ? (
                              <div className="text-blue-700">
                                登录后才可以发表评论哦，
                                <Link to="/login" className="underline text-blue-600 hover:text-blue-700">登录</Link>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-2 mb-3">
                                  {(statusComments[s.id] || []).length === 0 ? (
                                    <div className="text-blue-600">暂无评论</div>
                                  ) : (
                                    (statusComments[s.id] || []).map(c => (
                                      <div key={c.id} className="p-3 rounded-xl bg-white border border-blue-100">
                                        <div className="text-sm text-blue-500 mb-1">用户 {c.user_id}</div>
                                        <div className="text-blue-800 whitespace-pre-wrap">{c.content}</div>
                                      </div>
                                    ))
                                  )}
                                  <div className="p-2 text-blue-600/80 text-sm">仅展示最新10条</div>
                                </div>
                                {!isOwner && (
                                  <div className="flex gap-2">
                                    <textarea
                                      value={statusCommentText[s.id] || ''}
                                      onChange={(e) => setStatusCommentText(prev => ({ ...prev, [s.id]: e.target.value }))}
                                      placeholder="写下你的评论..."
                                      className="flex-1 p-3 rounded-xl bg-white border border-blue-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 min-h-[60px]"
                                    />
                                    <button onClick={() => sendStatusComment(s.id)} disabled={!((statusCommentText[s.id] || '').trim())} className="px-4 h-[42px] self-end rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50">发送</button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 个人资料编辑面板（仅自己） */}
      {isOwner && (
        <ProfilePanel
          isVisible={showEditPanel}
          onClose={() => setShowEditPanel(false)}
          profileData={viewProfile}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
}