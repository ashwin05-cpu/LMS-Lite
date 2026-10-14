import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi, discussionApi } from '../services/api';
import {
  MessagesSquare,
  Pin,
  Lock,
  Plus,
  MessageCircle,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function Discussions() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // New Discussion Modal
  const [showModal, setShowModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    isPinned: false,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadDiscussions(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const res = await coursesApi.getPublic();
      const list = res.data || [];
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourseId(list[0].id);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadDiscussions = async (courseId) => {
    setLoading(true);
    try {
      const res = await discussionApi.getCourseDiscussions(courseId);
      setDiscussions(res.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await discussionApi.create({
        ...newTopic,
        courseId: parseInt(selectedCourseId),
      });
      setMessage({ type: 'success', text: 'Discussion thread created!' });
      setShowModal(false);
      setNewTopic({ title: '', description: '', category: 'GENERAL', isPinned: false });
      loadDiscussions(selectedCourseId);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Course Discussion & Q&A Forums</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Collaborative inquiry, topic-based discussions, and instructor office hour questions
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Start New Topic
        </button>
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

      {/* Filter Course Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center space-x-2">
          <span>Select Course Forum:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode}: {c.title}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs font-mono text-slate-400">{discussions.length} threads</span>
      </div>

      {/* Discussion List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <MessagesSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active discussions in this forum yet</h3>
          <p className="text-xs text-slate-500">Be the first to post a question or topic!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discussions.map((d) => (
            <Link
              key={d.id}
              to={`/discussions/${d.id}`}
              className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    {d.isPinned && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        <Pin className="w-3 h-3 mr-1" /> Pinned
                      </span>
                    )}
                    {d.isLocked && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                        <Lock className="w-3 h-3 mr-1" /> Locked
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase">
                      {d.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{d.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{d.description}</p>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0 text-xs text-slate-500">
                  <div className="text-right hidden sm:block">
                    <span className="font-semibold text-slate-700 block">{d.createdByName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(d.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{d.replyCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Topic Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Start Discussion Topic</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding JWT silent refresh interceptors"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="GENERAL">General Discussion</option>
                  <option value="Q_AND_A">Q&A / Help</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Details & Question Content</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Elaborate on your topic or post your technical question..."
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Post Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
