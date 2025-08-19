import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postApi } from '../requests/posts';
import { MarkdownEditor } from '../components/MarkdownEditor';

export function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [transferToWP, setTransferToWP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }
    
    if (!content.trim()) {
      setError('请输入文章内容');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await postApi.createPost(title.trim(), content.trim(), transferToWP);
      
      if (response.code === 200) {
        // 发布成功，返回到个人中心的文章管理页面
        navigate('/profile?tab=posts');
      } else {
        setError(response.message || '发布失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('发布失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
      {/* 顶部导航栏 */}
      <div className="w-full bg-white/70 backdrop-blur-md border-b border-white/60">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-blue-800">创建文章</h1>
          <Link 
            to="/profile?tab=posts" 
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            返回个人中心
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">新文章</h2>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-700 text-sm mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-blue-800 font-medium mb-2">文章标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="w-full p-3 rounded-xl bg-white/30 border border-white/40 
                         text-blue-800 placeholder-blue-500/60 focus:outline-none 
                         focus:ring-2 focus:ring-purple-500/30"
                placeholder="请输入文章标题"
              />
            </div>
            
            <div>
              <label className="block text-blue-800 font-medium mb-2">文章内容</label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="使用 Markdown 编写文章内容..."
                mode="post"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-blue-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transferToWP}
                  onChange={(e) => setTransferToWP(e.target.checked)}
                  disabled={isLoading}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>同步到 WordPress</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Link
                to="/profile?tab=posts"
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 
                         transition-colors font-medium"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !content.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                         hover:from-blue-600 hover:to-purple-700 rounded-xl text-white 
                         font-medium transition-all duration-200 shadow-lg 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '发布中...' : '发布文章'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}