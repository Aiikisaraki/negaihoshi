import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Tag, Tabs, message } from 'antd'
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'

const { TabPane } = Tabs

interface Content {
  id: number
  content: string
  user_id: number
  status: string
  created_at: string
}

const ContentManagement: React.FC = () => {
  const [treeholes, setTreeholes] = useState<Content[]>([])
  const [statuses, setStatuses] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const [treeholeRes, statusRes] = await Promise.all([
        axios.get('/api/admin/content/treehole'),
        axios.get('/api/admin/content/status')
      ])
      setTreeholes(treeholeRes.data.data.treeholes || [])
      setStatuses(statusRes.data.data.statuses || [])
    } catch (error) {
      message.error('获取内容列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (type: 'treehole' | 'status', id: number) => {
    try {
      await axios.post(`/api/admin/content/${type}/${id}/approve`)
      message.success('审核通过')
      fetchContent()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReject = async (type: 'treehole' | 'status', id: number) => {
    try {
      await axios.post(`/api/admin/content/${type}/${id}/reject`, { reason: '内容违规' })
      message.success('审核拒绝')
      fetchContent()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (type: 'treehole' | 'status', id: number) => {
    try {
      await axios.delete(`/api/admin/content/${type}/${id}`)
      message.success('删除成功')
      fetchContent()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const getColumns = (type: 'treehole' | 'status') => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status === 'approved' ? '已审核' : status === 'pending' ? '待审核' : '已拒绝'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Content) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button 
                type="link" 
                icon={<CheckOutlined />}
                onClick={() => handleApprove(type, record.id)}
              >
                通过
              </Button>
              <Button 
                type="link" 
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(type, record.id)}
              >
                拒绝
              </Button>
            </>
          )}
          <Button 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(type, record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>内容管理</h1>
      
      <Card>
        <Tabs defaultActiveKey="treehole">
          <TabPane tab="树洞消息" key="treehole">
            <Table
              columns={getColumns('treehole')}
              dataSource={treeholes}
              loading={loading}
              rowKey="id"
              pagination={{
                total: treeholes.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
          <TabPane tab="动态" key="status">
            <Table
              columns={getColumns('status')}
              dataSource={statuses}
              loading={loading}
              rowKey="id"
              pagination={{
                total: statuses.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default ContentManagement
