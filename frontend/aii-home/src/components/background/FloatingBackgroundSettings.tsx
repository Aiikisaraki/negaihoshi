import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/floatingBackgroundMenu.css';

const FloatingBackgroundSettings: React.FC = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight / 2 });
  const [isNearEdge, setIsNearEdge] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  

  // 从localStorage加载保存的背景图和位置
  useEffect(() => {
    const savedBackground = localStorage.getItem('customBackground');
    if (savedBackground) {
      setTempUrl(savedBackground);
      applyBackground(savedBackground);
    }
    
    // 加载保存的位置
    const savedPosition = localStorage.getItem('backgroundButtonPosition');
    if (savedPosition) {
      try {
        const parsedPosition = JSON.parse(savedPosition);
        setPosition(parsedPosition);
      } catch (e) {
        console.error('Failed to parse saved position', e);
      }
    }
  }, []);

  // 检测是否靠近屏幕边缘
  const checkIfNearEdge = (pos: {x: number, y: number}) => {
    const edgeThreshold = 50; // 距离边缘多少像素触发
    const isNearLeftEdge = pos.x < edgeThreshold;
    const isNearRightEdge = pos.x > window.innerWidth - edgeThreshold;
    const isNearTopEdge = pos.y < edgeThreshold;
    const isNearBottomEdge = pos.y > window.innerHeight - edgeThreshold;
    
    return isNearLeftEdge || isNearRightEdge || isNearTopEdge || isNearBottomEdge;
  };
  
  // 持续检查是否靠近边缘
  useEffect(() => {
    // 初始检查
    setIsNearEdge(checkIfNearEdge(position));
    
    // 设置定时器持续检查
    const intervalId = setInterval(() => {
      setIsNearEdge(checkIfNearEdge(position));
    }, 100); // 每100ms检查一次
    
    return () => clearInterval(intervalId);
  }, [position]);

  // 监听窗口大小变化，确保按钮不会超出屏幕
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 30),
        y: Math.min(prev.y, window.innerHeight - 30)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // 保存按钮位置
  const savePosition = (newPosition: { x: number, y: number }) => {
    localStorage.setItem('backgroundButtonPosition', JSON.stringify(newPosition));
  };

  // 计算菜单位置
  const getMenuPosition = () => {
    // 根据按钮位置计算菜单位置，避免超出屏幕
    const isRightSide = position.x > window.innerWidth / 2;
    
    if (isRightSide) {
      return { right: window.innerWidth - position.x, top: position.y };
    } else {
      return { left: position.x + 50, top: position.y };
    }
  };

  return (
    <>
      {/* 可拖动的触发按钮 */}
      <motion.div
        ref={triggerRef}
        className={`floating-background-trigger ${isNearEdge ? 'near-edge' : ''}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          x: position.x, 
          y: position.y,
          position: 'fixed',
          top: 0,
          left: 0
        }}
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => setIsMenuVisible(false)}
        onDrag={(_event, info) => {
          // 实时检查是否靠近边缘
          const currentPos = { 
            x: position.x + info.offset.x, 
            y: position.y + info.offset.y 
          };
          setIsNearEdge(checkIfNearEdge(currentPos));
        }}
        onDragEnd={(_e, info) => {
          // 更新位置并保存
          const newPosition = { 
            x: position.x + info.offset.x, 
            y: position.y + info.offset.y 
          };
          setPosition(newPosition);
          savePosition(newPosition);
        }}
        onClick={() => {
          if (!isNearEdge) {
            setIsMenuVisible(!isMenuVisible);
          }
        }}
        title="设置主页背景"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span role="img" aria-label="背景设置">🎨</span>
      </motion.div>

      {/* 背景设置菜单 - 根据按钮位置自适应显示 */}
      <AnimatePresence>
        {isMenuVisible && (
          <motion.div
            ref={menuRef}
            style={getMenuPosition()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            className="floating-background-menu"
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

export default FloatingBackgroundSettings;




