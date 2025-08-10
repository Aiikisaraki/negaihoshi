import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import ContentManagement from './pages/ContentManagement'
import SystemSettings from './pages/SystemSettings'
import SystemLogs from './pages/SystemLogs'

function App() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/settings" element={<SystemSettings />} />
        <Route path="/logs" element={<SystemLogs />} />
      </Routes>
    </AdminLayout>
  )
}

export default App
