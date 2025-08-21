import { useState, useEffect } from 'react';
import { postApi, StatusItem } from '../../requests/posts';

interface StatusManagementProps {
  userId: number;
}

export function StatusManagement({ userId }: StatusManagementProps) {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStatuses = async () => {
    try {
      setLoading(true);
      const response = await postApi.getStatusList();
      if (response.code === 200) {
        const statusesData = response.data as StatusItem[];
        const userStatuses = statusesData.filter(status => status.userId === userId);
        setStatuses(userStatuses);
      } else {
        setError('获取说说列表失败');
      }
    } catch (err) {
      setError('获取说说列表时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStatuses();
  }, [userId]);

  const handleCreateStatus = async () => {
    if (!content.trim()) {
      setError('说说内容不能为空');
      return;
    }

    try {
      const response = await postApi.createStatus(content);
      if (response.code === 200) {
        setContent('');
        fetchUserStatuses();
        setError(null);
      } else {
        setError('创建说说失败: ' + response.message);
      }
    } catch (err) {
      setError('创建说说时发生错误');
      console.error(err);
    }
  };

  const handleEditStatus = async () => {
    if (!editingId || !content.trim()) {
      setError('说说内容不能为空');
      return;
    }
    try {
      const response = await postApi.editStatus(editingId, content);
      if (response.code === 200) {
        setEditingId(null);
        setContent('');
        fetchUserStatuses();
        setError(null);
      } else {
        setError('编辑说说失败: ' + response.message);
      }
    } catch (err) {
      setError('编辑说说时发生错误');
      console.error(err);
    }
  };

  const startEditing = (status: StatusItem) => {
    setEditingId(status.id);
    setContent(status.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setContent('');
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/40">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">说说管理</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}
      <div className="mb-8 bg-blue-50/50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-700 mb-4">{editingId ? '编辑说说' : '发布新说说'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-blue-700 font-medium mb-2">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="分享你的想法..."
            />
          </div>
          <div className="flex space-x-3">
            {editingId ? (
              <>
                <button onClick={handleEditStatus} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">更新说说</button>
                <button onClick={cancelEditing} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">取消</button>
              </>
            ) : (
              <button onClick={handleCreateStatus} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">发布说说</button>
            )}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-blue-700 mb-4">我的说说</h3>
        {statuses.length === 0 ? (
          <div className="text-center py-8 text-blue-600">暂无说说，分享你的第一条说说吧！</div>
        ) : (
          <div className="space-y-4">
            {statuses.map((status) => (
              <div key={status.id} className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-blue-600 mb-4">{status.content}</p>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => startEditing(status)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">编辑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


