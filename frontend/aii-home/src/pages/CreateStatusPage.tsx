import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postApi } from '../requests/posts';
import { MarkdownEditor } from '../components/MarkdownEditor';

export function CreateStatusPage() {
  const [content, setContent] = useState('');
  const [transferToWP, setTransferToWP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 统计有效字符（排除 markdown 控制符）
  const countEffectiveChars = (md: string) => {
    const stripped = md
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '') // 代码块与行内代码
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '') // 图片
      .replace(/\[[^\]]*\]\([^\)]*\)/g, '') // 链接
      .replace(/[*_~#>`-]/g, '') // 常见标记
      .replace(/\s+/g, ''); // 空白
    return stripped.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('请输入说说内容');
      return;
    }
    
    // 检查有效字符数是否超过200
    const effectiveChars = countEffectiveChars(content);
    if (effectiveChars > 200) {
      setError(`说说有效字符数不可超过200（当前 ${effectiveChars}）`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await postApi.createStatus(content.trim(), transferToWP);
      
      if (response.code === 200) {
        // 发布成功，返回到个人中心的说说管理页面
        navigate('/profile?tab=status');
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
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-blue-800">发布说说</h1>
          <Link 
            to="/profile?tab=status" 
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            返回个人中心
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">新说说</h2>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-700 text-sm mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-blue-800 font-medium mb-2">说说内容</label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="分享你的想法... (支持 Markdown 格式，有效字符不超过200字)"
                maxLength={200}
                mode="status"
                editorMinHeight={360}
                dense
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
            
            <div className="flex justify-end gap-4 pt-3">
              <Link
                to="/profile?tab=status"
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 
                         transition-colors font-medium"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                         hover:from-blue-600 hover:to-purple-700 rounded-xl text-white 
                         font-medium transition-all duration-200 shadow-lg 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '发布中...' : '发布说说'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}