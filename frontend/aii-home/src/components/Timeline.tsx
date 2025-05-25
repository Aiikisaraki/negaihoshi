/*
 * @Author: Aiikisaraki morikawa@kimisui56.work
 * @Date: 2025-05-25 10:45:45
 * @LastEditors: Aiikisaraki morikawa@kimisui56.work
 * @LastEditTime: 2025-05-25 10:49:08
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\Timeline.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { motion } from 'framer-motion';
// import { Clock } from 'heroicons-react';

export const Timeline = () => {
  const posts = [
    { id: 1, user: '星野梦美', content: '今天的星空特别美呢～', time: '15:30' },
    { id: 2, user: '雾雨魔理沙', content: '发现新的魔法材料啦！', time: '14:45' },
  ];

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-white/5 backdrop-blur-sm"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
              {/* <MessageSquare className="w-4 h-4 text-blue-300" /> */}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="font-medium text-pink-200">{post.user}</span>
                <span className="text-xs text-white/50 flex items-center">
                  {/* <Clock className="w-3 h-3 mr-1" /> */}
                  {post.time}
                </span>
              </div>
              <p className="mt-1 text-white/90">{post.content}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};