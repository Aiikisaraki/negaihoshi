/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-08-21 20:27:08
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-21 20:27:08
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\Footer.tsx
 * @Description: 页脚组件，包含版权信息和备案号
 */
import { Link } from 'react-router-dom';

interface FooterProps {
  // 可以添加自定义属性
  copyrightYear?: number;
  copyrightName?: string;
  recordNumber?: string;
}

export const Footer = ({
  copyrightYear = new Date().getFullYear(),
  copyrightName = 'Aii如樱如月',
  recordNumber = '粤ICP备XXXXXXXX号',
}: FooterProps) => {
  return (
    <footer className="w-full py-6 bg-white/30 backdrop-blur-sm border-t border-blue-100 mt-auto relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4">
          {/* 上半部分：版权信息和链接 */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div>
              <div className="text-blue-800 text-sm">
                © {copyrightYear} {copyrightName}. All rights reserved.
              </div>
              <div className="text-blue-600 text-xs mt-1">{recordNumber}</div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-blue-700 hover:text-blue-900 transition-colors">
                首页
              </Link>
              <span className="text-blue-300">|</span>
              <a 
                href="https://beian.miit.gov.cn/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-700 hover:text-blue-900 transition-colors"
              >
                {recordNumber}
              </a>
            </div>
          </div>
          
          {/* 背景设置按钮已移至悬浮球 */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;




