import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiLayers, FiList, FiAlertOctagon } from 'react-icons/fi';
import { adminService } from '../../api/services';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LoadingSkeleton, StatCard } from '../../components/ui';
import type { PlatformStats, User } from '../../types';

const AdminDashboardPage: React.FC = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers()
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch {
      showToast('Failed to load admin telemetry/user details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user? This will delete all of their products, routines, and journal history.')) return;
    try {
      await adminService.deleteUser(id);
      showToast('User and associated data purged from system.', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSkeleton type="text" count={2} />
        <div className="mt-6"><LoadingSkeleton type="list" count={4} /></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Admin Dashboard 🛡️</h1>
          <p className="page-subtitle">Monitor platform metrics, manage users, categories, ingredients, and compatibility policies</p>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" label="Total Members" value={stats?.totalUsers || 0} color="var(--color-lavender)" />
        <StatCard icon="🧴" label="Total Products" value={stats?.totalProducts || 0} color="var(--color-sky)" />
        <StatCard icon="📝" label="Total Logs" value={stats?.totalJournals || 0} color="var(--color-mint)" />
        <StatCard icon="🔥" label="Active Users (7d)" value={stats?.activeUsersCount || 0} color="var(--color-rose)" />
      </div>

      {/* Admin Quick Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link to="/admin/categories" className="no-underline">
          <motion.div whileHover={{ y: -2 }} className="glass-card p-4 flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-lavender/20 flex items-center justify-center text-lg text-lavender-dark">
              <FiLayers />
            </div>
            <div>
              <p className="text-sm font-bold">Categories</p>
              <p className="text-xs text-gray-500">Manage categories & icons</p>
            </div>
          </motion.div>
        </Link>
        <Link to="/admin/ingredients" className="no-underline">
          <motion.div whileHover={{ y: -2 }} className="glass-card p-4 flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-sky/20 flex items-center justify-center text-lg text-sky-dark">
              <FiList />
            </div>
            <div>
              <p className="text-sm font-bold">Ingredients</p>
              <p className="text-xs text-gray-500">Manage common ingredients</p>
            </div>
          </motion.div>
        </Link>
        <Link to="/admin/compatibility" className="no-underline">
          <motion.div whileHover={{ y: -2 }} className="glass-card p-4 flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-rose/20 flex items-center justify-center text-lg text-rose-light">
              <FiAlertOctagon />
            </div>
            <div>
              <p className="text-sm font-bold">Compatibility Rules</p>
              <p className="text-xs text-gray-500">Manage compound collision warnings</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Users table */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-sm mb-4">Platform Registrations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.15)' }}>
                <th className="pb-3 font-semibold text-gray-500">Name</th>
                <th className="pb-3 font-semibold text-gray-500">Email</th>
                <th className="pb-3 font-semibold text-gray-500">Role</th>
                <th className="pb-3 font-semibold text-gray-500">Joined Date</th>
                <th className="pb-3 font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b" style={{ borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.05)' }}>
                  <td className="py-3 font-bold flex items-center gap-2">
                    {u.profilePicture ? (
                      <img src={`http://localhost:5000${u.profilePicture}`} alt="u" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-lavender/30 flex items-center justify-center text-[10px]">{u.name?.charAt(0)}</span>
                    )}
                    {u.name}
                  </td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3">
                    <span className={`badge ${u.role === 'admin' ? 'badge-lavender' : 'badge-info'}`}>{u.role}</span>
                  </td>
                  <td className="py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 border-none cursor-pointer"
                        style={{ background: 'transparent' }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
