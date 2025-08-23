import React, { useEffect, useMemo, useState } from 'react';
import { apiConfig } from '../../config/api';

interface AvatarImageProps {
  src: string;
  alt?: string;
  className?: string;
  // 自定义后端前缀（当 src 为相对路径时）
  baseUrl?: string;
  // 自定义占位内容
  fallbackNode?: React.ReactNode;
}

export default function AvatarImage({
  src,
  alt = '头像',
  className,
  baseUrl,
  fallbackNode,
}: AvatarImageProps) {
  // 使用环境变量配置的API基础URL，移除/api后缀用于静态资源
  // 修复：确保baseURL是完整的URL，避免重复域名问题
  const defaultBaseUrl = useMemo(() => {
    const base = apiConfig.baseURL;
    // 如果baseURL已经是完整的URL，直接移除/api部分
    if (base.startsWith('http')) {
      return base.replace('/api', '');
    }
    // 如果是相对路径，返回空字符串，避免重复拼接
    return '';
  }, []);
  
  const finalBaseUrl = baseUrl || defaultBaseUrl;
  
  const resolvedSrc = useMemo(() => {
    if (!src || src.trim() === '') return '';
    
    // 如果src已经是完整的URL，直接返回
    if (src.startsWith('http')) {
      return src;
    }
    
    // 如果src是相对路径，需要添加baseUrl
    if (src.startsWith('/') && finalBaseUrl) {
      return `${finalBaseUrl}${src}`;
    }
    
    // 如果src是相对路径但没有baseUrl，返回空（显示fallback）
    if (src.startsWith('/') && !finalBaseUrl) {
      console.warn('AvatarImage: 相对路径头像需要baseUrl，但未提供:', src);
      return '';
    }
    
    // 其他情况，直接拼接
    return `${finalBaseUrl}${src}`;
  }, [src, finalBaseUrl]);

  const [imgSrc, setImgSrc] = useState<string>(resolvedSrc);

  useEffect(() => {
    setImgSrc(resolvedSrc);
  }, [resolvedSrc]);

  const handleError = () => {
    // 加载失败（包括 404/400/401/跨域等）时回退
    console.warn('AvatarImage: 头像加载失败:', resolvedSrc);
    setImgSrc('');
  };

  if (!imgSrc) {
    return (
      <div className={className}>
        {fallbackNode ?? (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}




