import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { postApi } from '../requests/posts';
import { MarkdownEditor } from '../components/markdown/MarkdownEditor';
import apiClient, { APIResponse } from '../requests/api';

export function CreateStatusPage() {
  const [content, setContent] = useState('');
  const [transferToWP, setTransferToWP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const edit = searchParams.get('edit') === '1';
    const idStr = searchParams.get('id');
    if (edit && idStr) {
      const idNum = parseInt(idStr, 10);
      if (!Number.isNaN(idNum)) {
        setIsEdit(true);
        setEditId(idNum);
        (async () => {
          try {
            const resp = await apiClient.get(`/posts/view/${idNum}?isPost=false`) as APIResponse<Record<string, unknown>>;
            if (resp.code === 200 && resp.data) {
              const data = resp.data as Record<string, unknown>;
              setContent(((data.content as string) ?? (data.Content as string) ?? ''));
            }
          } catch {
            setError('加载说说内容失败');
          }
        })();
      }
    }
  }, [searchParams]);

  // 同步浏览器标题
  useEffect(() => {
    const siteName = '星の海の物語';
    if (isEdit) {
      const short = (content || '').replace(/\s+/g, ' ').slice(0, 20) || '未命名';
      document.title = `编辑说说: ${short} —— ${siteName}`;
    } else {
      document.title = `发布说说 —— ${siteName}`;
    }
  }, [isEdit, content]);

  // 统计有效字符（排除 markdown 控制符）
  const countEffectiveChars = (md: string) => {
    const stripped = md
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/[*_~#>`-]/g, '')
      .replace(/\s+/g, '');
    return stripped.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('请输入说说内容');
      return;
    }
    const effectiveChars = countEffectiveChars(content);
    if (effectiveChars > 200) {
      setError(`说说有效字符数不可超过200（当前 ${effectiveChars}）`);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      let response: { code: number; message?: string };
      if (isEdit && editId) {
        response = await postApi.editStatus(editId, content.trim(), transferToWP);
      } else {
        response = await postApi.createStatus(content.trim(), transferToWP);
      }
      if (response.code === 200) {
        navigate('/profile?tab=status');
      } else {
        setError(response.message || '提交失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('提交失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
      {/* 顶部导航栏 */}
      <div className="w-full bg-white/70 backdrop-blur-md border-b border-white/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-blue-800">{isEdit ? '编辑说说' : '发布说说'}</h1>
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
          <h2 className="text-2xl font-bold text-blue-800 mb-6">{isEdit ? '更新说说' : '新说说'}</h2>
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
                {isLoading ? (isEdit ? '更新中...' : '发布中...') : (isEdit ? '更新说说' : '发布说说')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}