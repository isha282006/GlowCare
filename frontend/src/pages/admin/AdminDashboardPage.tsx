import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Layers, List, AlertOctagon } from 'lucide-react';
import { adminService } from '../../api/services';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSkeleton, StatCard } from '../../components/ui';
import type { PlatformStats, User } from '../../types';

const AdminDashboardPage: React.FC = () => {
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
      <div className="page-container relative z-10">
        <LoadingSkeleton type="text" count={2} />
        <div className="mt-6"><LoadingSkeleton type="list" count={4} /></div>
      </div>
    );
  }

  return (
    <div className="page-container relative z-10">
      <div className="flex items-center justify-between mb-8 text-left">
        <div>
          <h1 className="page-title flex items-center gap-2">Admin Dashboard 🛡️</h1>
          <p className="page-subtitle">Monitor platform metrics, manage users, categories, ingredients, and compatibility policies</p>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" label="Total Members" value={stats?.totalUsers || 0} color="var(--color-primary)" />
        <StatCard icon="🧴" label="Total Products" value={stats?.totalProducts || 0} color="#60A5FA" />
        <StatCard icon="📝" label="Total Logs" value={stats?.totalJournals || 0} color="#34D399" />
        <StatCard icon="🔥" label="Active Users (7d)" value={stats?.activeUsersCount || 0} color="var(--color-accent)" />
      </div>

      {/* Admin Quick Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Link to="/admin/categories" className="no-underline">
          <motion.div whileHover={{ y: -2 }} className="glass-card p-4.5 flex items-center gap-3.5 cursor-pointer border border-white/40 shadow-sm text-left">
            <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-primary border border-pink-100/30 shadow-sm">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Categories</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Manage categories & icons</p>
            </div>
          </motion.div>
        </Link>
        <Link to="/admin/ingredients" className="no-underline">
          <motion.div whileHover={{ y: -2 }} className="glass-card p-4.5 flex items-center gap-3.5 cursor-pointer border border-white/40 shadow-sm text-left">
            <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-primary border border-pink-100/30 shadow-sm">
              <List size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Ingredients</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Manage common ingredients</p>
            </div>
          </motion.div>
        </Link>
        <Link to="/admin/compatibility" className="no-underline">
          <motion.div whileHover={{ y: -2 }} className="glass-card p-4.5 flex items-center gap-3.5 cursor-pointer border border-white/40 shadow-sm text-left">
            <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-primary border border-pink-100/30 shadow-sm">
              <AlertOctagon size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Compatibility Rules</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Manage compound collision warnings</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Users table */}
      <div className="glass-card p-6 border border-white/40 shadow-sm text-left">
        <h3 className="font-extrabold text-sm mb-5 text-gray-750">Platform Registrations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-pink-100/50">
                <th className="pb-3.5 font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="pb-3.5 font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="pb-3.5 font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="pb-3.5 font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                <th className="pb-3.5 font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-pink-50/20 hover:bg-pink-50/10 transition-colors">
                  <td className="py-3.5 font-bold flex items-center gap-2.5 text-gray-700">
                    {u.profilePicture ? (
                      <img src={`http://localhost:5000${u.profilePicture}`} alt="u" className="w-6.5 h-6.5 rounded-full object-cover border border-pink-100/50" />
                    ) : (
                      <span className="w-6.5 h-6.5 rounded-full bg-pink-50/50 border border-pink-100/20 flex items-center justify-center text-[9px] font-black text-primary">{u.name?.charAt(0)}</span>
                    )}
                    {u.name}
                  </td>
                  <td className="py-3.5 text-gray-500 font-semibold">{u.email}</td>
                  <td className="py-3.5">
                    <span className={`badge ${u.role === 'admin' ? 'badge-lavender' : 'badge-info'} text-[9px] uppercase font-black`}>{u.role}</span>
                  </td>
                  <td className="py-3.5 text-gray-400 font-semibold">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-coral hover:bg-red-50 border-none cursor-pointer bg-transparent"
                      >
                        <Trash2 size={14} />
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
