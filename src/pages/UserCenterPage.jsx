import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Edit2, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import UserLayout from '../components/UserLayout';

const UserCenterPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [userInfo, setUserInfo] = useState({
    email: '',
    username: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setUserInfo({
      email: user.email,
      username: user.username
    });
  }, [user, navigate]);

  const handleUpdateProfile = async () => {
    try {
      await axios.put('/api/auth/profile', userInfo);
      updateUser({ ...user, ...userInfo });
      setEditing(false);
      alert('个人信息更新成功');
    } catch (error) {
      alert('更新失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('两次输入的新密码不一致');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('新密码长度至少为 6 位');
      return;
    }

    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('密码修改成功');
    } catch (error) {
      alert('修改失败: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!user) return null;

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{user.username}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <Mail size={14} />
                  {user.email}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                  <Calendar size={12} />
                  注册时间: {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              {editing ? <X size={16} /> : <Edit2 size={16} />}
              {editing ? '取消' : '编辑'}
            </button>
          </div>

          {editing && (
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">用户名</label>
                <input
                  type="text"
                  value={userInfo.username}
                  onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">邮箱</label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                <Save size={16} />
                保存修改
              </button>
            </div>
          )}
        </div>

        {/* 密码修改卡片 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-2">账户安全</h3>
              <p className="text-sm text-slate-500">修改您的登录密码</p>
            </div>
            <button
              onClick={() => setChangingPassword(!changingPassword)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              {changingPassword ? <X size={16} /> : <Lock size={16} />}
              {changingPassword ? '取消' : '修改密码'}
            </button>
          </div>

          {changingPassword && (
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">当前密码</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="请输入当前密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">新密码</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="请输入新密码（至少6位）"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">确认新密码</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="请再次输入新密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleChangePassword}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                <Lock size={16} />
                确认修改
              </button>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserCenterPage;
