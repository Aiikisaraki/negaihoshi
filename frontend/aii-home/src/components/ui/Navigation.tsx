/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-07-26 20:27:08
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-20 19:07:55
 * @FilePath: \negaihoshi\frontend\aii-home\src\components\Navigation.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useEffect, useState } from 'react';
import { userApi } from '../../requests/posts';
import { Link } from 'react-router-dom';
import AvatarImage from '../user/AvatarImage';
import { useToast } from '../feedback/Toast';

interface NavigationProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  userProfile?: {
    id?: number;
    avatar?: string;
    nickname?: string;
    username?: string;
  };
}

export function Navigation({ isLoggedIn, onLogout, userProfile }: NavigationProps) {
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(userProfile?.avatar);
  // 弹窗登录已废弃，统一跳转 /login
  const _toast = useToast();

  // 登录后或导航挂载时尝试获取最新头像
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const resp = await userApi.getAvatar();
        if (resp.code === 200 && resp.data?.avatar_url) {
          setAvatarUrl(resp.data.avatar_url);
        }
      } catch (e) {
        console.debug('拉取头像失败', e);
      }
    })();
  }, [isLoggedIn]);

  // 弹窗登录已废弃，统一跳转 /login

  return (
    <>
      {/* 更柔和的导航栏 */}
      <nav className="relative z-50 bg-gradient-to-r from-blue-400/80 via-indigo-400/80 to-cyan-400/80 backdrop-blur-xl border-b border-white/30 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Logo和标题 */}
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-white">星の海の物語</h1>
                <p className="text-sm text-blue-50 hidden sm:block">在星空下分享你的心情</p>
              </div>
            </div>

            {/* 右侧用户区域 */}
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <a
                  href="/login"
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  登录
                </a>
              ) : (
                <>
                  {/* 用户头像和用户名 - 可点击显示菜单 */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 bg-white/20 rounded-full px-3 py-2 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/40">
                        <AvatarImage
                          src={avatarUrl || userProfile?.avatar || ''}
                          className="w-full h-full object-cover"
                          fallbackNode={
                            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          }
                        />
                      </div>
                      <span className="text-white font-medium text-sm hidden sm:inline">
                        {userProfile?.nickname || userProfile?.username || '用户'}
                      </span>
                      {/* 下拉箭头 */}
                      <svg 
                        className={`w-4 h-4 text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* 用户菜单 */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/40 overflow-hidden z-50">
                      <div className="py-2">
                        {/* 个人中心 */}
                        <Link
                          to={`/profile/${userProfile?.id ?? ''}`}
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200 flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>个人中心</span>
                        </Link>
                        {/* 编辑个人信息 */}
                        <Link
                          to={`/profile/${userProfile?.id ?? ''}?edit=1`}
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200 flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 14v-7m-7 7h14M5 12h14M5 8h14" />
                          </svg>
                          <span>编辑个人信息</span>
                        </Link>
                        {/* 分割线 */}
                        <div className="border-t border-gray-200 my-1"></div>
                        {/* 登出按钮 */}
                        <button
                          onClick={() => {
                            onLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>登出</span>
                        </button>
                      </div>
                    </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 登录弹窗已移除 */}
    </>
  );
}


