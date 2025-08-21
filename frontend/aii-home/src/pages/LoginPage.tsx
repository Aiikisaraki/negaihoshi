import { useState } from 'react';
import { Link, /* useNavigate, */ useSearchParams } from 'react-router-dom';
import { authApi } from '../requests/posts';
import apiClient, { APIResponse } from '../requests/api';
import { useToast } from '../components/feedback/Toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const navigate = useNavigate(); // 未使用，后续需要时再启用
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await authApi.login(username.trim(), password);
      if (resp.code === 200) {
        const loginUserId = (resp.data as { user_id?: number } | undefined)?.user_id;
        let mergedProfile: Record<string, unknown> = {};
        // 拉取最新资料
        try {
          const profile = await apiClient.get('/users/profile') as APIResponse<Record<string, unknown>>;
          if (profile.code === 200 && profile.data) {
            mergedProfile = { ...profile.data };
          }
        } catch {
          // ignore
        }
        // 合并ID，确保存在
        if (loginUserId && !mergedProfile.id) {
          mergedProfile.id = loginUserId;
        }
        // 至少写入登录状态与基本资料
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userProfile', JSON.stringify(mergedProfile));
        toast.show('登录成功', { type: 'success' });
        const ret = searchParams.get('returnTo');
        if (ret) {
          window.location.href = ret;
        } else {
          window.location.href = '/';
        }
      } else {
        setError(resp.message || '登录失败');
      }
    } catch (err: unknown) {
      const e = err as { message?: string } | undefined;
      const msg = (e && typeof e === 'object' && typeof e.message === 'string')
        ? e.message
        : '网络错误，请稍后重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/40">
        <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">登录</h1>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-800 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/30 border border-white/40 text-blue-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="输入用户名"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-blue-800 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/30 border border-white/40 text-blue-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="输入密码"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div className="mt-4 text-center text-blue-700">
          还没有账号？
          <Link to="/signup" className="ml-1 underline text-blue-600 hover:text-blue-700">去注册</Link>
        </div>
      </div>
    </div>
  );
}


