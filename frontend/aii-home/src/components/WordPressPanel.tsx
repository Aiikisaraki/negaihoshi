import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { wordpressApi, WordPressSite } from '../requests/posts';

export const WordPressPanel = () => {
  const [sites, setSites] = useState<WordPressSite[]>([]);
  const [showBindForm, setShowBindForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bindForm, setBindForm] = useState({
    site_url: '',
    username: '',
    api_key: '',
    site_name: '',
    wp_user_id: 1
  });

  // 获取已绑定站点
  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const response = await wordpressApi.getSites();
      if (response.code === 200) {
        setSites(response.data.sites || []);
      }
    } catch (error) {
      console.error('获取站点失败:', error);
    }
  };

  const handleBind = async () => {
    if (!bindForm.site_url || !bindForm.username || !bindForm.api_key) {
      return;
    }

    setLoading(true);
    try {
      const response = await wordpressApi.bind({
        site_url: bindForm.site_url,
        username: bindForm.username,
        api_key: bindForm.api_key,
        site_name: bindForm.site_name,
        wp_user_id: bindForm.wp_user_id
      });
      
      if (response.code === 200) {
        // 重新加载站点列表
        await loadSites();
        setShowBindForm(false);
        setBindForm({
          site_url: '',
          username: '',
          api_key: '',
          site_name: '',
          wp_user_id: 1
        });
      } else {
        console.error('绑定失败:', response.message);
      }
    } catch (error) {
      console.error('绑定失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbind = async (siteId: number) => {
    try {
      const response = await wordpressApi.unbind(siteId);
      if (response.code === 200) {
        setSites(prev => prev.filter(site => site.id !== siteId));
      } else {
        console.error('解绑失败:', response.message);
      }
    } catch (error) {
      console.error('解绑失败:', error);
    }
  };

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xl shadow-lg">
      {/* 标题和添加按钮 */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-blue-800">WordPress 集成</h3>
        <button
          onClick={() => setShowBindForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 rounded-xl text-white text-base font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
        >
          + 绑定站点
        </button>
      </div>

      {/* 已绑定的站点列表 */}
      <div className="space-y-3">
        {sites.length === 0 ? (
          <div className="text-center p-8 text-blue-600">
            暂未绑定WordPress站点
            <br />
            <button
              onClick={() => setShowBindForm(true)}
              className="mt-2 text-blue-300 hover:text-blue-200 transition-colors"
            >
              立即绑定
            </button>
          </div>
        ) : (
          sites.map(site => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{site.site_name}</h4>
                  <p className="text-sm text-white/70">{site.site_url}</p>
                  <p className="text-xs text-white/50 mt-1">
                    用户: {site.username} • 绑定于 {new Date(site.bind_time).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleUnbind(site.id)}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  解绑
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 绑定表单弹窗 */}
      <AnimatePresence>
        {showBindForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowBindForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">绑定WordPress站点</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    站点URL *
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-site.com"
                    value={bindForm.site_url}
                    onChange={e => setBindForm(prev => ({ ...prev, site_url: e.target.value }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    站点名称
                  </label>
                  <input
                    type="text"
                    placeholder="我的博客"
                    value={bindForm.site_name}
                    onChange={e => setBindForm(prev => ({ ...prev, site_name: e.target.value }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    用户名 *
                  </label>
                  <input
                    type="text"
                    placeholder="WordPress用户名"
                    value={bindForm.username}
                    onChange={e => setBindForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    应用密码 *
                  </label>
                  <input
                    type="password"
                    placeholder="WordPress应用密码"
                    value={bindForm.api_key}
                    onChange={e => setBindForm(prev => ({ ...prev, api_key: e.target.value }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    请在WordPress后台用户设置中生成应用密码
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowBindForm(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleBind}
                  disabled={loading || !bindForm.site_url || !bindForm.username || !bindForm.api_key}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  {loading ? '绑定中...' : '绑定'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
