import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../requests/posts';
import { useToast } from '../components/Toast';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setError('请完整填写用户名、邮箱与密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await authApi.register(username.trim(), password, email.trim());
      if (resp.code === 200) {
        toast.show('注册成功，请登录', { type: 'success' });
        navigate('/login');
      } else {
        setError(resp.message || '注册失败');
      }
    } catch (e) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/40">
        <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">注册</h1>
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
            <label className="block text-blue-800 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/30 border border-white/40 text-blue-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              placeholder="输入邮箱"
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
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div className="mt-4 text-center text-blue-700">
          已有账号？
          <Link to="/login" className="ml-1 underline text-blue-600 hover:text-blue-700">去登录</Link>
        </div>
      </div>
    </div>
  );
}


