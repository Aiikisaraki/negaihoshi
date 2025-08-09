import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../requests/posts';

interface AuthPanelProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const AuthPanel = ({ isLoggedIn, onLoginSuccess, onLogout }: AuthPanelProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('请填写用户名和密码');
      return;
    }

    if (!isLogin && !formData.email) {
      setError('请填写邮箱地址');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await authApi.login(formData.username, formData.password);
        if (response.code === 200) {
          onLoginSuccess();
          setShowAuth(false);
          setFormData({ username: '', password: '', email: '' });
        } else {
          setError(response.message || '登录失败');
        }
      } else {
        const response = await authApi.register(formData.username, formData.password, formData.email);
        if (response.code === 200) {
          setError('');
          setIsLogin(true); // 注册成功后切换到登录
        } else {
          setError(response.message || '注册失败');
        }
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('认证失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      onLogout();
    } catch (err) {
      console.error('登出失败:', err);
      // 即使API失败也执行本地登出
      onLogout();
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', password: '', email: '' });
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-white/80">欢迎回来</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
      >
        登录
      </button>

      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {isLogin ? '登录账户' : '注册账户'}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                    placeholder="请输入用户名"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    密码
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                    placeholder="请输入密码"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  {loading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={toggleAuthMode}
                  className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                >
                  {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
                </button>
              </div>

              <button
                onClick={() => setShowAuth(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
