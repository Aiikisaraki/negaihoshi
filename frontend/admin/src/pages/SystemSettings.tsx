import React, { useState, useEffect, useCallback } from 'react'
import { Card, Form, Input, Switch, InputNumber, Button, message } from 'antd'
import axios from 'axios'

interface SystemSettingsData {
  site_name: string
  site_description: string
  allow_register: boolean
  content_review: boolean
  max_post_length: number
  api_docs_enabled: boolean
}

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/admin/settings')
      form.setFieldsValue(response.data.data.settings)
    } catch (error) {
      message.error('获取系统设置失败')
    } finally {
      setLoading(false)
    }
  }, [form])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSubmit = async (values: SystemSettingsData) => {
    setSaving(true)
    try {
      await axios.put('/api/admin/settings', values)
      message.success('设置保存成功')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>系统设置</h1>
      
      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            site_name: '树洞系统',
            site_description: '一个匿名分享心情的平台',
            allow_register: true,
            content_review: false,
            max_post_length: 1000,
            api_docs_enabled: true,
          }}
        >
          <Form.Item
            name="site_name"
            label="站点名称"
            rules={[{ required: true, message: '请输入站点名称' }]}
          >
            <Input placeholder="请输入站点名称" />
          </Form.Item>
          
          <Form.Item
            name="site_description"
            label="站点描述"
            rules={[{ required: true, message: '请输入站点描述' }]}
          >
            <Input.TextArea 
              rows={3}
              placeholder="请输入站点描述" 
            />
          </Form.Item>
          
          <Form.Item
            name="allow_register"
            label="允许注册"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="content_review"
            label="内容审核"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="max_post_length"
            label="最大发布长度"
            rules={[{ required: true, message: '请输入最大发布长度' }]}
          >
            <InputNumber 
              min={100} 
              max={10000} 
              placeholder="请输入最大发布长度" 
            />
          </Form.Item>
          
          <Form.Item
            name="api_docs_enabled"
            label="启用API文档"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default SystemSettings
