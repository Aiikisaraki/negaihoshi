import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/content',
      icon: <FileTextOutlined />,
      label: '内容管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      key: '/logs',
      icon: <LogoutOutlined />,
      label: '系统日志',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 处理退出登录
      navigate('/login')
    }
  }

  return (
    <Layout className="admin-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="admin-sider"
      >
        <div className="admin-logo" style={{ padding: '16px', textAlign: 'center' }}>
          {collapsed ? '树洞' : '树洞管理后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: '18px', color: 'white', cursor: 'pointer' }
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BellOutlined style={{ fontSize: '18px', color: 'white', cursor: 'pointer' }} />
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer', color: 'white' }}>
                <Avatar icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout

