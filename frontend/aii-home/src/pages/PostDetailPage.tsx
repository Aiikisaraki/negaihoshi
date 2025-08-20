import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../requests/api';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { interactApi } from '../requests/interact';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Array<{ id: number; content: string; user_id: number; ctime: number }>>([]);
  const [commentText, setCommentText] = useState('');
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const navigate = useNavigate();

  const loadPost = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response: any = await apiClient.post('/posts/view', { id: parseInt(id), isPost: true });
      if (response.code === 200) {
        setPost(response.data);
      } else {
        setError('文章不存在或已被删除');
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
      const likeResp = await interactApi.likeCount(parseInt(id), true);
      if (likeResp.code === 200) setLikeCount(likeResp.data.count || 0);
      const commentsResp = await interactApi.listComments(parseInt(id), true, 1, 50);
      if (commentsResp.code === 200) {
        const items = (commentsResp.data.comments || []) as any[];
        setComments(items.map(i => ({ id: i.id, content: i.content, user_id: i.user_id, ctime: i.ctime })));
      }
    } catch (e) {
      console.debug('加载互动数据失败', e);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  useEffect(() => {
    loadLikesAndComments();
  }, [id]);

  const handleLike = async () => {
    if (!id || liking) return;
    setLiking(true);
    try {
      await interactApi.like(parseInt(id), true);
      await loadLikesAndComments();
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
      await interactApi.unlike(parseInt(id), true);
      await loadLikesAndComments();
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
            <h1 className="text-3xl font-bold text-blue-800 mb-4">{post.title}</h1>
            <div className="flex items-center text-blue-600 text-sm justify-between">
              <span>
                {post.ctime ? new Date(post.ctime).toLocaleString('zh-CN') : '未知时间'}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-blue-700">点赞 {likeCount}</span>
                <button onClick={handleLike} disabled={liking} className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">点赞</button>
                <button onClick={handleUnlike} disabled={liking} className="px-3 py-1 rounded-lg bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50">取消</button>
              </div>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none mb-10">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* 评论区 */}
          <div className="bg-white/70 border border-blue-100 rounded-2xl p-5 shadow">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">评论</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
}