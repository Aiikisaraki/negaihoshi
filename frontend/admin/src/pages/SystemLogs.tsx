import React, { useState, useEffect, useCallback } from 'react'
import { Table, Card, Tag, Select } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import axios from 'axios'

interface Log {
  id: number
  level: string
  message: string
  user_id?: number
  timestamp: string
  stack?: string
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState<string>('all')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const url = level === 'error' ? '/api/admin/logs/error' : '/api/admin/logs'
      const response = await axios.get(url, {
        params: { level: level === 'all' ? '' : level }
      })
      setLogs(response.data.data.logs || [])
    } catch (error) {
      console.error('获取日志失败:', error)
    } finally {
      setLoading(false)
    }
  }, [level])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => {
        const colors = {
          ERROR: 'red',
          WARN: 'orange',
          INFO: 'blue',
          DEBUG: 'default'
        }
        return <Tag color={colors[level as keyof typeof colors] || 'default'}>{level}</Tag>
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
      render: (userId: number) => userId || '-',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>系统日志</h1>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Select
            value={level}
            onChange={setLevel}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部级别</Select.Option>
            <Select.Option value="ERROR">错误</Select.Option>
            <Select.Option value="WARN">警告</Select.Option>
            <Select.Option value="INFO">信息</Select.Option>
            <Select.Option value="DEBUG">调试</Select.Option>
          </Select>
          
          <ReloadOutlined 
            onClick={fetchLogs}
            style={{ cursor: 'pointer', fontSize: '16px' }}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          pagination={{
            total: logs.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '16px', background: '#f5f5f5' }}>
                <p><strong>完整消息:</strong> {record.message}</p>
                {record.stack && (
                  <div>
                    <p><strong>堆栈信息:</strong></p>
                    <pre style={{ background: '#fff', padding: '8px', borderRadius: '4px' }}>
                      {record.stack}
                    </pre>
                  </div>
                )}
              </div>
            ),
          }}
        />
      </Card>
    </div>
  )
}

export default SystemLogs
