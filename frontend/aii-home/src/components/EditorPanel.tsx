import { useState } from 'react';
import { motion } from 'framer-motion';
import { treeholeApi } from '../requests/posts';

interface EditorPanelProps {
  onPostSuccess?: () => void;
}

export const EditorPanel = ({ onPostSuccess }: EditorPanelProps) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('请输入内容');
      return;
    }

    if (content.length > 1000) {
      setError('内容不能超过1000字符');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await treeholeApi.create(content.trim());
      
      if (response.code === 200) {
        setContent(''); // 清空输入框
        onPostSuccess?.(); // 通知父组件刷新列表
      } else {
        setError(response.message || '发布失败');
      }
    } catch (err) {
      setError('网络错误，请检查登录状态');
      console.error('发布失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="space-y-6 p-6 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xl shadow-lg"
    >
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {/* 功能按钮预留位置 */}
        </div>
        <div className="text-sm text-blue-600">
          {content.length}/1000 字符 • Ctrl+Enter 快速发布
        </div>
      </div>
      
      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="w-full h-36 p-5 rounded-2xl bg-white/30 backdrop-blur-xl 
                 border border-white/40 focus:border-purple-500/60 
                 text-blue-800 placeholder-blue-500/60 
                 focus:outline-none focus:ring-2 focus:ring-purple-500/30
                 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-base"
        placeholder="分享你的心情... (支持 Ctrl+Enter 快速发布)"
      />
      
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !content.trim()}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 
                   rounded-xl text-white font-semibold text-base
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-lg transform hover:scale-105"
        >
          {isLoading ? '发布中...' : '发布动态'}
        </button>
      </div>
    </motion.div>
  );
};