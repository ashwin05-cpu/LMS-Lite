import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  ShieldAlert,
  Users,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audit' | 'config'
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await adminApi.getUsers();
        setUsers(res.data || []);
      } else if (activeTab === 'audit') {
        const res = await adminApi.getAuditLogs();
        setAuditLogs(res.data || []);
      } else if (activeTab === 'config') {
        const res = await adminApi.getSystemConfig();
        setConfigs(res.data || []);
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminApi.toggleStatus(userId);
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (e) {
      alert('Error updating user status: ' + e.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateRole(userId, newRole);
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (e) {
      alert('Error changing user role: ' + e.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-purple-600" />
            Institutional Governance & Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            User lifecycle controls, FERPA compliance audit trails, and platform configurations
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Lifecycle Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>FERPA Security Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'config'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Policies & Configuration</span>
        </button>
      </div>

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono text-slate-400">{filteredUsers.length} accounts found</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Student / Emp ID</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{u.fullName}</span>
                      <span className="text-[11px] text-slate-500">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TEACHING_ASSISTANT">Teaching Assistant</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="CONTENT_CREATOR">Content Creator</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="GUEST">Guest</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{u.studentId || 'N/A'}</td>
                    <td className="px-4 py-3">{u.department || 'General'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FERPA AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">FERPA Academic Audit Trail</h2>
              <p className="text-[11px] text-slate-500">
                Tamper-evident logs of authentications, grade submissions, and permission modifications
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Last 100 logged events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{log.username || 'System'}</td>
                    <td className="px-4 py-3 text-indigo-600">{log.role || 'GUEST'}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{log.action}</td>
                    <td className="px-4 py-3">{log.resource}</td>
                    <td className="px-4 py-3 max-w-sm truncate text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Institutional Platform Configuration</h2>
            <p className="text-xs text-slate-500">Core policies enforced across course enrollment and grading</p>
          </div>

          <div className="space-y-4">
            {configs.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700">{c.configKey}</span>
                  <span className="text-[10px] text-slate-400">
                    Updated {new Date(c.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{c.description}</p>
                <input
                  type="text"
                  readOnly
                  value={c.configValue}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
