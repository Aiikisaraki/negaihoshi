import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../requests/api';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

interface StatusItem {
  id: number;
  content: string;
  userId: number;
  ctime?: string;
  utime?: string;
}

export function StatusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<StatusItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response: any = await apiClient.post('/posts/view', { id: parseInt(id), isPost: false });
        
        if (response.code === 200) {
          setStatus(response.data);
        } else {
          setError('说说不存在或已被删除');
        }
      } catch (err) {
        setError('获取说说失败');
        console.error('获取说说失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [id]);

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

  if (error || !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-blue-800 mb-4">说说未找到</h1>
          <p className="text-blue-600 mb-6">{error || '您访问的说说不存在或已被删除'}</p>
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
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-blue-800">说说详情</h1>
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40">
          <div className="flex items-center text-blue-600 text-sm mb-6 pb-6 border-b border-blue-100">
            <span>
              {status.ctime ? new Date(status.ctime).toLocaleString('zh-CN') : '未知时间'}
            </span>
          </div>
          
          <div className="prose max-w-none">
            <MarkdownRenderer content={status.content} />
          </div>
        </div>
      </div>
    </div>
  );
}