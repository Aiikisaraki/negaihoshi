import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Modal, Form, Input, Select, message, Tag } from 'antd'
import { UserOutlined, EditOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import axios from 'axios'

interface User {
  id: number
  email: string
  username?: string
  status: string
  role: string
  created_at: string
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/admin/users')
      setUsers(response.data.data.users || [])
    } catch (error) {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setModalVisible(true)
  }

  const handleDelete = async (userId: number) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      message.success('删除成功')
      fetchUsers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleBan = async (userId: number) => {
    try {
      await axios.post(`/api/admin/users/${userId}/ban`, { reason: '违规行为' })
      message.success('封禁成功')
      fetchUsers()
    } catch (error) {
      message.error('封禁失败')
    }
  }

  const handleUnban = async (userId: number) => {
    try {
      await axios.post(`/api/admin/users/${userId}/unban`)
      message.success('解封成功')
      fetchUsers()
    } catch (error) {
      message.error('解封失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await axios.put(`/api/admin/users/${editingUser.id}`, values)
        message.success('更新成功')
      }
      setModalVisible(false)
      setEditingUser(null)
      form.resetFields()
      fetchUsers()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '封禁'}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'blue' : 'default'}>
          {role === 'admin' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'active' ? (
            <Button 
              type="link" 
              danger
              icon={<StopOutlined />}
              onClick={() => handleBan(record.id)}
            >
              封禁
            </Button>
          ) : (
            <Button 
              type="link" 
              onClick={() => handleUnban(record.id)}
            >
              解封
            </Button>
          )}
          <Button 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>用户管理</h1>
      
      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            total: users.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="编辑用户"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingUser(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="banned">封禁</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                setEditingUser(null)
                form.resetFields()
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
