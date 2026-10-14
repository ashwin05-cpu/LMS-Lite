import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { discussionApi } from '../services/api';
import {
  ArrowLeft,
  Pin,
  Lock,
  ThumbsUp,
  Send,
  MessageCircle,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function DiscussionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const isModerator = ['INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN'].includes(user?.role);

  useEffect(() => {
    loadThread();
  }, [id]);

  const loadThread = async () => {
    setLoading(true);
    try {
      const [dRes, pRes] = await Promise.all([
        discussionApi.getById(id),
        discussionApi.getPosts(id),
      ]);
      setDiscussion(dRes.data);
      setPosts(pRes.data || []);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await discussionApi.addPost(id, { content: replyText });
      setReplyText('');
      const pRes = await discussionApi.getPosts(id);
      setPosts(pRes.data || []);
    } catch (e) {
      alert('Error posting reply: ' + e.message);
    }
  };

  const handleToggleLock = async () => {
    try {
      await discussionApi.toggleLock(id);
      loadThread();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleTogglePin = async () => {
    try {
      await discussionApi.togglePin(id);
      loadThread();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      await discussionApi.upvotePost(postId);
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
      );
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!discussion) {
    return <div className="text-center py-12 text-slate-500">Thread not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/discussions"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Discussions
      </Link>

      {/* Main Topic Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
              {discussion.courseTitle}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
              {discussion.category}
            </span>
            {discussion.isPinned && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                <Pin className="w-3 h-3 mr-1" /> Pinned
              </span>
            )}
            {discussion.isLocked && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                <Lock className="w-3 h-3 mr-1" /> Locked
              </span>
            )}
          </div>

          {/* Moderator Controls */}
          {isModerator && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTogglePin}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                {discussion.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={handleToggleLock}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                {discussion.isLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold text-slate-900 leading-snug">{discussion.title}</h1>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {discussion.description}
        </p>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">{discussion.createdByName}</span>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-600">
              {discussion.createdByRole}
            </span>
          </div>
          <span>{new Date(discussion.createdDate).toLocaleString()}</span>
        </div>
      </div>

      {/* Replies Stream */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Responses & Collaboration ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No replies yet. Join the conversation below!
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {post.userName?.charAt(0) || 'U'}
                  </div>
                  <span className="font-bold text-slate-900">{post.userName}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {post.userRole}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(post.createdDate).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-9">
                {post.content}
              </p>

              <div className="pl-9 pt-2 flex items-center space-x-3 text-xs text-slate-500">
                <button
                  onClick={() => handleUpvote(post.id)}
                  className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 font-semibold"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{post.upvotes} Helpful</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Input Box */}
      {discussion.isLocked ? (
        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-center text-xs text-slate-600 font-semibold flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4 text-slate-500" />
          <span>This discussion has been locked by an instructor. Further responses are disabled.</span>
        </div>
      ) : (
        <form onSubmit={handleSendReply} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            Write a constructive response
          </label>
          <textarea
            rows="3"
            required
            placeholder="Share your technical insights, code snippets, or clarifying answers..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Post Response
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
