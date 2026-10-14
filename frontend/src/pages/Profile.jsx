import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import {
  User,
  Mail,
  Building,
  Shield,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    department: '',
    institutionId: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await userApi.getProfile();
      const data = res.data;
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        department: data.department || '',
        institutionId: data.institutionId || '',
        bio: data.bio || '',
      });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      await userApi.updateProfile(profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Academic & Educational Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal information, institutional affiliation, and biography
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-2 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            {profile.firstName ? profile.firstName.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {user?.role?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">@{user?.username}</span>
              {user?.studentId && (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  ID: {user?.studentId}
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution ID</label>
              <input
                type="text"
                value={profile.institutionId}
                onChange={(e) => setProfile({ ...profile, institutionId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic Biography</label>
            <textarea
              rows="4"
              placeholder="Tell others about your academic journey, research, or interests..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
