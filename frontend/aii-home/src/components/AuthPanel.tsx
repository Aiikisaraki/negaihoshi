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
  const [isFullScreen, setIsFullScreen] = useState(false);
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
          // 显示成功消息
          setError('注册成功！请使用新账户登录');
          // 清空表单
          setFormData({ username: '', password: '', email: '' });
          // 3秒后清除成功消息
          setTimeout(() => setError(''), 3000);
        } else {
          setError(response.message || '注册失败');
        }
      }
    } catch (err: unknown) {
      // 处理API错误响应
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('网络错误，请稍后重试');
      }
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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-white/80 text-sm sm:text-base">欢迎回来</span>
        <button
          onClick={handleLogout}
          className="px-3 sm:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors text-sm sm:text-base"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowAuth(true)}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base font-medium shadow-lg"
        >
          登录
        </button>
        <button
          onClick={toggleFullScreen}
          className="p-2 text-white/60 hover:text-white/80 transition-colors hover:bg-white/10 rounded-lg"
          title={isFullScreen ? "使用紧凑模式" : "使用全屏模式"}
        >
          {isFullScreen ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${
              isFullScreen ? 'p-0' : 'p-4'
            }`}
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 ${
                isFullScreen 
                  ? 'w-full h-full rounded-none flex flex-col justify-center items-center p-8' 
                  : 'p-6 sm:p-8 w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setShowAuth(false)}
                className={`absolute text-white/50 hover:text-white/80 transition-colors hover:bg-white/10 rounded-full ${
                  isFullScreen 
                    ? 'top-8 right-8 w-10 h-10' 
                    : 'top-4 right-4 sm:top-6 sm:right-6 w-8 h-8'
                } flex items-center justify-center`}
                title="关闭登录窗口"
                aria-label="关闭登录窗口"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 标题区域 */}
              <div className={`text-center mb-6 sm:mb-8 ${isFullScreen ? 'mb-12' : ''}`}>
                <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
                  isFullScreen ? 'w-24 h-24 mb-6' : 'w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4'
                }`}>
                  <svg className={`text-white ${
                    isFullScreen ? 'w-12 h-12' : 'w-6 h-6 sm:w-8 sm:h-8'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className={`font-bold text-white mb-2 ${
                  isFullScreen ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-xl sm:text-2xl lg:text-3xl'
                }`}>
                  {isLogin ? '欢迎回来' : '创建账户'}
                </h3>
                <p className={`text-white/60 px-2 ${
                  isFullScreen ? 'text-lg sm:text-xl lg:text-2xl' : 'text-sm sm:text-base lg:text-lg'
                }`}>
                  {isLogin ? '登录您的账户继续使用' : '注册新账户开始您的旅程'}
                </p>
              </div>

              {/* 错误提示 */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-xl backdrop-blur-sm ${
                    isFullScreen 
                      ? 'mb-8 p-6 text-lg' 
                      : 'mb-4 sm:mb-6 p-3 sm:p-4 text-sm'
                  } ${
                    // 根据错误内容判断是成功消息还是错误消息
                    error.includes('成功') || error.includes('注册成功')
                      ? 'bg-green-500/20 border-green-500/30 text-green-300'
                      : 'bg-red-500/20 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {error.includes('成功') || error.includes('注册成功') ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              {/* 表单 */}
              <form onSubmit={handleSubmit} className={`space-y-4 sm:space-y-6 ${
                isFullScreen ? 'space-y-8 w-full max-w-md' : 'w-full max-w-lg mx-auto'
              }`}>
                <div>
                  <label className={`font-semibold text-white/80 mb-2 block ${
                    isFullScreen ? 'text-lg' : 'text-sm sm:text-base'
                  }`}>
                    用户名
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${
                      isFullScreen ? 'p-6 text-lg' : 'p-3 sm:p-4 text-sm sm:text-base'
                    }`}
                    placeholder="请输入用户名"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className={`font-semibold text-white/80 mb-2 block ${
                      isFullScreen ? 'text-lg' : 'text-sm sm:text-base'
                    }`}>
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${
                        isFullScreen ? 'p-6 text-lg' : 'p-3 sm:p-4 text-sm sm:text-base'
                      }`}
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                )}

                <div>
                  <label className={`font-semibold text-white/80 mb-2 block ${
                    isFullScreen ? 'text-lg' : 'text-sm sm:text-base'
                  }`}>
                    密码
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${
                      isFullScreen ? 'p-6 text-lg' : 'p-3 sm:p-4 text-sm sm:text-base'
                    }`}
                    placeholder="请输入密码"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                    isFullScreen ? 'py-6 text-xl' : 'py-3 sm:py-4 text-base sm:text-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`border-2 border-white/30 border-t-white rounded-full animate-spin ${
                        isFullScreen ? 'w-6 h-6' : 'w-4 h-4 sm:w-5 sm:h-5'
                      }`}></div>
                      <span>{isLogin ? '登录中...' : '注册中...'}</span>
                    </div>
                  ) : (
                    isLogin ? '登录' : '注册'
                  )}
                </button>
              </form>

              {/* 切换模式 */}
              <div className={`text-center ${
                isFullScreen ? 'mt-12' : 'mt-6 sm:mt-8'
              }`}>
                <button
                  onClick={toggleAuthMode}
                  className="text-blue-300 hover:text-blue-200 transition-colors hover:underline text-sm sm:text-base"
                >
                  {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
                </button>
              </div>

              {/* 底部装饰 */}
              <div className={`pt-4 sm:pt-6 border-t border-white/10 ${
                isFullScreen ? 'mt-12' : 'mt-6 sm:mt-8'
              }`}>
                <p className="text-center text-white/40 text-xs sm:text-sm">
                  登录即表示您同意我们的服务条款和隐私政策
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
