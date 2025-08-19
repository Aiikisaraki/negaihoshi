/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-07-26 20:27:08
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-20 01:04:41
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\EditorPanel.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

    setIsLoading(true);
    setError('');

    try {
      const response = await treeholeApi.create(content.trim());
      
      if (response.code === 200) {
        setContent('');
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
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="text-sm text-blue-600">
          Ctrl+Enter 快速发布
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
        placeholder={'分享你的心情... (树洞，纯文本)'}
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
          {isLoading ? '发布中...' : '发布树洞'}
        </button>
      </div>
    </motion.div>
  );
};