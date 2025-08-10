import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import { UserOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import axios from 'axios'

interface DashboardStats {
  user_stats: {
    total_users: number
    active_users: number
    banned_users: number
    growth_rate: string
    new_users_today: number
    new_users_week: number
  }
  content_stats: {
    total_treeholes: number
    pending_review: number
    approved_content: number
    rejected_content: number
    new_content_today: number
    new_content_week: number
  }
  system_stats: {
    total_status: number
    total_posts: number
    system_uptime: string
    memory_usage: string
    disk_usage: string
    cpu_usage: string
    active_sessions: number
  }
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard')
      setStats(response.data.data)
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const userChartOption = {
    title: {
      text: '用户增长趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '用户数',
        type: 'line',
        data: [120, 200, 350, 500, 800, 1250],
        smooth: true
      }
    ]
  }

  const contentChartOption = {
    title: {
      text: '内容发布统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '内容类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1250, name: '树洞消息' },
          { value: 850, name: '动态' },
          { value: 320, name: '文章' }
        ]
      }
    ]
  }

  const recentActivities = [
    {
      key: '1',
      user: '张三',
      action: '发布了树洞消息',
      content: '今天天气真好...',
      time: '2025-01-20 10:30:00',
      status: 'pending'
    },
    {
      key: '2',
      user: '李四',
      action: '发布了动态',
      content: '分享一个有趣的想法...',
      time: '2025-01-20 09:15:00',
      status: 'approved'
    }
  ]

  const activityColumns = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'approved' ? 'green' : 'orange'}>
          {status === 'approved' ? '已审核' : '待审核'}
        </Tag>
      ),
    },
  ]

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>仪表板</h1>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats?.user_stats.total_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日新增用户"
              value={stats?.user_stats.new_users_today || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总内容数"
              value={stats?.content_stats.total_treeholes || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核内容"
              value={stats?.content_stats.pending_review || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="用户增长趋势" className="chart-container">
            <ReactECharts option={userChartOption} style={{ height: '300px' }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="内容类型分布" className="chart-container">
            <ReactECharts option={contentChartOption} style={{ height: '300px' }} />
          </Card>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card title="系统状态">
            <p>运行时间: {stats?.system_stats.system_uptime}</p>
            <p>内存使用: {stats?.system_stats.memory_usage}</p>
            <p>磁盘使用: {stats?.system_stats.disk_usage}</p>
            <p>CPU使用: {stats?.system_stats.cpu_usage}</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="内容统计">
            <p>树洞消息: {stats?.content_stats.total_treeholes}</p>
            <p>动态: {stats?.system_stats.total_status}</p>
            <p>文章: {stats?.system_stats.total_posts}</p>
            <p>活跃会话: {stats?.system_stats.active_sessions}</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="用户统计">
            <p>总用户: {stats?.user_stats.total_users}</p>
            <p>活跃用户: {stats?.user_stats.active_users}</p>
            <p>封禁用户: {stats?.user_stats.banned_users}</p>
            <p>增长率: {stats?.user_stats.growth_rate}</p>
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Card title="最近活动" className="table-container">
        <Table
          columns={activityColumns}
          dataSource={recentActivities}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default Dashboard
