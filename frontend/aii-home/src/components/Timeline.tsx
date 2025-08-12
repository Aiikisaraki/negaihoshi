/*
 * @Author: Aiikisaraki morikawa@kimisui56.work
 * @Date: 2025-05-25 10:45:45
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-06 21:37:38
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\Timeline.tsx
 * @Description: 树洞时间线组件
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { treeholeApi, TreeHoleMessage } from '../requests/posts';

interface TimelineProps {
  refreshTrigger?: number;
}

export const Timeline = ({ refreshTrigger }: TimelineProps) => {
  const [messages, setMessages] = useState<TreeHoleMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMessages = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      const response = await treeholeApi.getList(pageNum, 10);
      
      if (response.code === 200) {
        const newMessages = response.data.messages || [];
        
        if (reset) {
          setMessages(newMessages);
        } else {
          setMessages(prev => [...prev, ...newMessages]);
        }
        
        setHasMore(newMessages.length === 10);
        setError('');
      } else {
        setError(response.message || '加载失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('加载消息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和刷新
  useEffect(() => {
    loadMessages(1, true);
    setPage(1);
  }, [refreshTrigger]);

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage, false);
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString();
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-300 border-t-transparent"></div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="text-center p-6">
        <div className="text-white/60 mb-4">{error}</div>
        <button 
          onClick={() => loadMessages(1, true)}
          className="px-4 py-2 bg-blue-400/20 hover:bg-blue-400/30 rounded-lg text-blue-300 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 rounded-2xl bg-white/20 backdrop-blur-xl hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-blue-700">#</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-3 mb-3">
                  <span className="font-medium text-blue-800">匿名用户</span>
                  <span className="text-sm text-blue-600">
                    {formatTime(message.ctime)}
                  </span>
                </div>
                <p className="text-blue-700 leading-relaxed whitespace-pre-wrap break-words text-base">
                  {message.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {messages.length === 0 && !loading && (
        <div className="text-center py-10 text-blue-600">
          暂无动态，快来发布第一条吧！
        </div>
      )}
      
      {hasMore && messages.length > 0 && (
        <div className="text-center">
          <button 
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:via-purple-500/30 hover:to-cyan-500/30 rounded-full text-blue-700 transition-all duration-200 disabled:opacity-50 border border-blue-400/40 shadow-lg font-medium"
          >
            {loading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  );
};