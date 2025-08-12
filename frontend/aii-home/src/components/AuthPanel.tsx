import { useState } from 'react';
import { motion } from 'framer-motion';
import { authApi } from '../requests/posts';

interface AuthPanelProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  onClose?: () => void; // 新增onClose属性
}

export const AuthPanel = ({ isLoggedIn, onLoginSuccess, onClose }: AuthPanelProps) => {
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

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', password: '', email: '' });
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // 如果已登录，不显示任何内容
  if (isLoggedIn) {
    return null;
  }

  // 作为模态框显示
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${
        isFullScreen ? 'p-0' : 'p-4'
      }`}
      onClick={onClose}
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
          onClick={onClose}
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
            className={`border rounded-xl backdrop-blur-sm mb-4 ${
              // 根据错误内容判断是成功消息还是错误消息
              error.includes('成功') || error.includes('注册成功')
                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}>
            <div className="flex items-center space-x-2 p-3">
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
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm sm:text-base font-medium text-white/80 mb-2">
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="请输入用户名"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm sm:text-base font-medium text-white/80 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm sm:text-base font-medium text-white/80 mb-2">
                密码
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="请输入密码"
                required
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } shadow-lg`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>处理中...</span>
              </div>
            ) : (
              isLogin ? '登录' : '注册'
            )}
          </button>
        </form>

        {/* 切换模式按钮 */}
        <div className="text-center mt-6 sm:mt-8">
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-white/60 hover:text-white/80 transition-colors text-sm sm:text-base"
          >
            {isLogin ? '还没有账户？点击注册' : '已有账户？点击登录'}
          </button>
        </div>

        {/* 全屏切换按钮 */}
        <button
          onClick={toggleFullScreen}
          className={`absolute text-white/50 hover:text-white/80 transition-colors hover:bg-white/10 rounded-lg ${
            isFullScreen ? 'bottom-8 left-8 p-3' : 'bottom-4 left-4 sm:bottom-6 sm:left-6 p-2'
          }`}
          title={isFullScreen ? "使用紧凑模式" : "使用全屏模式"}
        >
          {isFullScreen ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
