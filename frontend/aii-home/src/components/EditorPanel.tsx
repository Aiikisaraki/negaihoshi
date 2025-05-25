import { useState } from 'react';
import { motion } from 'framer-motion';
// import { Sparkles, PaperClip } from 'heroicons-react';

export const EditorPanel = () => {
  const [content, setContent] = useState('');

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="space-y-4"
    >
      <div className="flex space-x-2">
        {/* <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
          <Sparkles className="w-5 h-5 text-blue-300" />
        </button>
        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
          <Paperclip className="w-5 h-5 text-pink-300" />
        </button> */}
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-32 p-4 rounded-xl bg-white/10 backdrop-blur-sm 
                 border border-white/20 focus:border-pink-300/50 
                 text-white placeholder-white/50 
                 focus:outline-none focus:ring-2 focus:ring-pink-300/30"
        placeholder="分享你的心情..."
      />
      
      <button
        className="px-6 py-2 bg-gradient-to-r from-pink-400 to-blue-400 
                 rounded-full text-white font-medium hover:opacity-90 
                 transition-opacity float-right"
      >
        发布动态
      </button>
    </motion.div>
  );
};