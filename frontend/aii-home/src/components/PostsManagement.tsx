import { useState, useEffect } from 'react';
import { postApi, PostItem } from '../requests/posts';

interface PostsManagementProps {
  userId: number;
}

export function PostsManagement({ userId }: PostsManagementProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 获取用户自己的文章列表
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      // 注意：当前API没有直接获取用户文章的接口，这里暂时获取所有文章
      // 后续需要后端提供根据用户ID获取文章的接口
      const response = await postApi.getPostsList();
      if (response.code === 200) {
        const postsData = response.data as PostItem[];
        // 过滤出当前用户的文章
        const userPosts = postsData.filter(post => post.userId === userId);
        setPosts(userPosts);
      } else {
        setError('获取文章列表失败');
      }
    } catch (err) {
      setError('获取文章列表时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }

    try {
      const response = await postApi.createPost(title, content);
      if (response.code === 200) {
        setTitle('');
        setContent('');
        fetchUserPosts(); // 重新获取文章列表
        setError(null);
      } else {
        setError('创建文章失败: ' + response.message);
      }
    } catch (err) {
      setError('创建文章时发生错误');
      console.error(err);
    }
  };

  const handleEditPost = async () => {
    if (!editingId || !title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }

    try {
      const response = await postApi.editPost(editingId, title, content);
      if (response.code === 200) {
        setEditingId(null);
        setTitle('');
        setContent('');
        fetchUserPosts(); // 重新获取文章列表
        setError(null);
      } else {
        setError('编辑文章失败: ' + response.message);
      }
    } catch (err) {
      setError('编辑文章时发生错误');
      console.error(err);
    }
  };

  const startEditing = (post: PostItem) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/40">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">文章管理</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 创建/编辑文章表单 */}
      <div className="mb-8 bg-blue-50/50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-700 mb-4">
          {editingId ? '编辑文章' : '创建新文章'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-blue-700 font-medium mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入文章标题"
            />
          </div>
          <div>
            <label className="block text-blue-700 font-medium mb-2">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入文章内容"
            />
          </div>
          <div className="flex space-x-3">
            {editingId ? (
              <>
                <button
                  onClick={handleEditPost}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  更新文章
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={handleCreatePost}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                创建文章
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div>
        <h3 className="text-xl font-semibold text-blue-700 mb-4">我的文章</h3>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-blue-600">
            暂无文章，创建你的第一篇文章吧！
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="text-lg font-semibold text-blue-800 mb-2">{post.title}</h4>
                <p className="text-blue-600 mb-4 line-clamp-3">{post.content}</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => startEditing(post)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    编辑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}