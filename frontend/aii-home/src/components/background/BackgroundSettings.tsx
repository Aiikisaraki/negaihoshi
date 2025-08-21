import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/backgroundMenu.css';

const BackgroundSettings: React.FC = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isTriggerVisible, setIsTriggerVisible] = useState(true); // 在页脚中始终可见
  const [tempUrl, setTempUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // 从localStorage加载保存的背景图
  useEffect(() => {
    const savedBackground = localStorage.getItem('customBackground');
    if (savedBackground) {
      setTempUrl(savedBackground);
      applyBackground(savedBackground);
    }
  }, []);

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMenuVisible &&
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsMenuVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuVisible]);

  // 应用背景图
  const applyBackground = (url: string) => {
    if (url && url.trim()) {
      document.documentElement.style.setProperty('--background-image', `url(${url})`);
      localStorage.setItem('customBackground', url);
    } else {
      document.documentElement.style.setProperty('--background-image', 'none');
      localStorage.removeItem('customBackground');
    }
  };

  // 处理背景图设置
  const handleSetBackground = async () => {
    if (!tempUrl.trim()) {
      applyBackground('');
      setIsMenuVisible(false);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // 验证图片URL是否有效
      const img = new Image();
      img.onload = () => {
        applyBackground(tempUrl);
        setIsLoading(false);
        setIsMenuVisible(false);
      };
      img.onerror = () => {
        setError('无法加载图片，请检查URL是否正确');
        setIsLoading(false);
      };
      img.src = tempUrl;
    } catch {
      setError('设置背景图失败，请检查URL格式');
      setIsLoading(false);
    }
  };

  // 重置背景图
  const handleResetBackground = () => {
    setTempUrl('');
    applyBackground('');
    setIsMenuVisible(false);
    setError('');
  };

  return (
    <>
      {/* 触发按钮 - 设计感十足的按钮 */}
      <AnimatePresence>
        {isTriggerVisible && (
          <motion.div
            ref={triggerRef}
            initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
            className="background-menu-trigger"
            onClick={() => {
              setIsMenuVisible(!isMenuVisible);
              // 确保点击按钮后触发按钮保持可见
              setIsTriggerVisible(true);
            }}
            title="设置主页背景"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span role="img" aria-label="背景设置">🎨</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 背景设置菜单 - 悬浮在页脚上方 */}
      <AnimatePresence>
        {isMenuVisible && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            className="background-menu"
            onClick={(e) => e.stopPropagation()} // 防止点击菜单时关闭菜单
          >
            <div className="background-menu-content">
              <h3>🎨 背景设置</h3>
              
              {/* 错误提示 */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="background-error"
                >
                  {error}
                </motion.div>
              )}

              {/* 输入框 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <input
                  type="url"
                  className="background-input"
                  placeholder="请输入图片URL地址"
                  value={tempUrl}
                  onChange={(e) => {
                    setTempUrl(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSetBackground();
                    }
                  }}
                />
              </motion.div>

              {/* 按钮组 */}
              <motion.div 
                className="background-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  className="background-btn background-btn-primary"
                  onClick={handleSetBackground}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4"></div>
                      <span>设置中...</span>
                    </div>
                  ) : (
                    '应用背景'
                  )}
                </button>
                <button
                  className="background-btn background-btn-secondary"
                  onClick={handleResetBackground}
                >
                  重置
                </button>
              </motion.div>

              {/* 预览区域 */}
              <motion.div 
                className="background-preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4>预览效果</h4>
                {tempUrl ? (
                  <img
                    src={tempUrl}
                    alt="背景预览"
                    onError={() => setError('图片加载失败')}
                  />
                ) : (
                  <div className="no-image">
                    默认渐变背景
                  </div>
                )}
              </motion.div>

              {/* 底部说明 */}
              <motion.div 
                className="background-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="background-footer-text">
                  本站不存储图片，请使用已上传的图片URL地址
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackgroundSettings;




