import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient, { APIResponse } from '../requests/api';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { interactApi } from '../requests/interact';
import AvatarImage from '../components/user/AvatarImage';

interface PostItem {
  id: number;
  title: string;
  content: string;
  userId: number;
  ctime?: string;
  utime?: string;
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostItem | null>(null);
  const [author, setAuthor] = useState<{ id: number; nickname?: string; username?: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Array<{ id: number; content: string; user_id: number; ctime: number }>>([]);
  const [commentText, setCommentText] = useState('');
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const normalizePost = (raw: Record<string, unknown>): PostItem => {
    return {
      id: (raw.id as number) ?? (raw.Id as number) ?? 0,
      title: (raw.title as string) ?? (raw.Title as string) ?? '',
      content: (raw.content as string) ?? (raw.Content as string) ?? '',
      userId: (raw.userId as number) ?? (raw.UserId as number) ?? 0,
      ctime: (raw.ctime as string) ?? (raw.Ctime as string) ?? (raw.Ctime ? String(raw.Ctime) : undefined),
      utime: (raw.utime as string) ?? (raw.Utime as string) ?? (raw.Utime ? String(raw.Utime) : undefined),
    };
  };

  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(savedLoginState === 'true');
  }, []);

  const loadPost = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/posts/view/${parseInt(id)}?isPost=true`) as APIResponse<PostItem | Record<string, unknown> | Array<Record<string, unknown>>>;
      if (response.code === 200) {
        const data = Array.isArray(response.data) ? (response.data[0] as Record<string, unknown>) : (response.data as Record<string, unknown>);
        const p = normalizePost(data);
        setPost(p);
        setError('');
        // 拉取作者资料
        if (p.userId) {
          try {
            const prof = await apiClient.get(`/users/profile/${p.userId}`) as APIResponse<{ nickname?: string; username?: string; avatar?: string }>;
            if (prof.code === 200 && prof.data) {
              setAuthor({ id: p.userId, nickname: prof.data.nickname, username: prof.data.username, avatar: prof.data.avatar });
            } else {
              setAuthor({ id: p.userId });
            }
          } catch {
            setAuthor({ id: p.userId });
          }
        }
      } else {
        setError(response.message || '文章不存在或已被删除');
      }
    } catch (err) {
      setError('获取文章失败');
      console.error('获取文章失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLikesAndComments = async () => {
    if (!id) return;
    try {
      const likeResp = await interactApi.likeCount(parseInt(id, 10), true);
      if (likeResp.code === 200) setLikeCount(likeResp.data.count || 0);
      const likedResp = await interactApi.isLiked(parseInt(id, 10), true);
      if (likedResp.code === 200) setLiked(!!likedResp.data.liked);
      if (isLoggedIn) {
        const commentsResp = await interactApi.listComments(parseInt(id, 10), true, 1, 50);
        if (commentsResp.code === 200) {
          const items = (commentsResp.data.comments || []) as Array<{ id: number; content: string; user_id: number; ctime: number }>;
          setComments(items.map(i => ({ id: i.id, content: i.content, user_id: i.user_id, ctime: i.ctime })));
        }
      } else {
        setComments([]);
      }
    } catch (e) {
      console.debug('加载互动数据失败', e);
    }
  };

  useEffect(() => {
    void loadPost();
  }, [id]);

  useEffect(() => {
    void loadLikesAndComments();
  }, [id, isLoggedIn]);

  // 更新浏览器标题
  useEffect(() => {
    const siteName = '星の海の物語';
    if (post?.title) {
      document.title = `${post.title}——${siteName}`;
    } else {
      document.title = `文章详情——${siteName}`;
    }
    return () => {
      // 可选：离开时还原标题
    };
  }, [post?.title]);

  const handleLike = async () => {
    if (!id || liking) return;
    setLiking(true);
    try {
      const r = await interactApi.like(parseInt(id), true);
      if (r.code === 200) {
        setLiked(true);
        setLikeCount(r.data.count ?? likeCount + 1);
      }
    } catch (e) {
      console.debug('点赞失败', e);
    } finally {
      setLiking(false);
    }
  };

  const handleUnlike = async () => {
    if (!id || liking) return;
    setLiking(true);
    try {
      const r = await interactApi.unlike(parseInt(id), true);
      if (r.code === 200) {
        setLiked(false);
        setLikeCount(r.data.count ?? Math.max(0, likeCount - 1));
      }
    } catch (e) {
      console.debug('取消点赞失败', e);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    if (!id || !commentText.trim() || commenting) return;
    setCommenting(true);
    try {
      await interactApi.addComment(parseInt(id), true, commentText.trim());
      setCommentText('');
      await loadLikesAndComments();
    } catch (e) {
      console.debug('评论失败', e);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-blue-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-blue-800 mb-4">文章未找到</h1>
          <p className="text-blue-600 mb-6">{error || '您访问的文章不存在或已被删除'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white transition-all duration-200 font-medium shadow-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
      {/* 顶部导航栏 */}
      <div className="w-full bg-white/70 backdrop-blur-md border-b border-white/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-blue-800">文章详情</h1>
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40">
          <div className="mb-6 pb-6 border-b border-blue-100">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-blue-800">{post.title || '无标题'}</h1>
              {author && (
                <Link to={`/profile/${author.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200">
                    <AvatarImage src={author.avatar || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-right">
                    <div className="text-blue-800 font-medium group-hover:text-blue-600 transition-colors">{author.nickname || author.username || `用户 ${author.id}`}</div>
                    <div className="text-xs text-blue-500">作者</div>
                  </div>
                </Link>
              )}
            </div>
            <div className="flex items-center text-blue-600 text-sm justify-between mt-3">
              <span>
                发布者 ID: {post.userId} ｜ {post.ctime ? new Date(post.ctime).toLocaleString('zh-CN') : '未知时间'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={liked ? handleUnlike : handleLike}
                  disabled={liking}
                  title={liked ? '取消点赞' : '点赞'}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${liked ? 'bg-red-500 text-white border-red-500' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'} disabled:opacity-50`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${liked ? '' : 'text-red-500'}`}>
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.462 2.25 9a4.5 4.5 0 018.159-2.606.75.75 0 001.282 0A4.5 4.5 0 0119.85 9c0 3.462-2.438 6.36-4.739 8.507a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.698 0l-.003-.002z" />
                  </svg>
                  <span>{likeCount}</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none mb-10">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* 评论区 */}
          <div className="bg-white/70 border border-blue-100 rounded-2xl p-5 shadow">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">评论</h2>
            {!isLoggedIn ? (
              <div className="text-blue-700">
                登录后才可以发表评论哦，
                <Link to="/login" className="underline text-blue-600 hover:text-blue-700">登录</Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-[360px] overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <div className="text-blue-600">还没有评论，来当第一个吧~</div>
                  ) : comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-white border border-blue-100">
                      <div className="text-sm text-blue-500 mb-1">用户 {c.user_id}</div>
                      <div className="text-blue-800 whitespace-pre-wrap">{c.content}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="写下你的看法..."
                    className="flex-1 p-3 rounded-xl bg-white border border-blue-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 min-h-[80px]"
                  />
                  <button onClick={handleComment} disabled={commenting || !commentText.trim()} className="px-5 h-[44px] self-end rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50">
                    发送
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}