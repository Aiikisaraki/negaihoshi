/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-01-27 10:00:00
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\ui\ConfigDisplay.tsx
 * @Description: 配置显示组件，用于在开发模式下显示当前API配置
 */

import React, { useState } from 'react';
import { apiConfig } from '../../config/api';

interface ConfigDisplayProps {
  className?: string;
}

export default function ConfigDisplay({ className = '' }: ConfigDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  // 只在开发模式下显示
  if (!apiConfig.devMode) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      {/* 切换按钮 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors"
        title="显示/隐藏API配置"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* 配置面板 */}
      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 p-4 min-w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">API 配置</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="关闭配置面板"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">API Base URL:</span>
              <span className="font-mono text-blue-600">{apiConfig.baseURL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">超时时间:</span>
              <span className="font-mono">{apiConfig.timeout}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">调试模式:</span>
              <span className={`font-mono ${apiConfig.debugMode ? 'text-green-600' : 'text-gray-500'}`}>
                {apiConfig.debugMode ? '启用' : '禁用'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">开发模式:</span>
              <span className={`font-mono ${apiConfig.devMode ? 'text-green-600' : 'text-gray-500'}`}>
                {apiConfig.devMode ? '启用' : '禁用'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              修改配置请编辑 .env 文件并重启开发服务器
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
