import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesApi, contentApi } from '../services/api';
import {
  Play,
  FileText,
  CheckCircle,
  Circle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Video,
  Download,
  BookOpen
} from 'lucide-react';

export default function CoursePlayer() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoursePlayer();
  }, [id]);

  const loadCoursePlayer = async () => {
    setLoading(true);
    try {
      const [cRes, cntRes] = await Promise.all([
        coursesApi.getById(id),
        contentApi.getCourseContents(id),
      ]);
      setCourse(cRes.data);
      const items = cntRes.data || [];
      setContents(items);
      if (items.length > 0) {
        setActiveLesson(items[0]);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (lessonId) => {
    try {
      await contentApi.toggleCompletion(lessonId);
      setContents(prev =>
        prev.map(l => (l.id === lessonId ? { ...l, isCompleted: !l.isCompleted } : l))
      );
      if (activeLesson?.id === lessonId) {
        setActiveLesson(prev => ({ ...prev, isCompleted: !prev.isCompleted }));
      }
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeIndex = contents.findIndex(c => c.id === activeLesson?.id);
  const completedCount = contents.filter(c => c.isCompleted).length;
  const progressPercent = contents.length > 0 ? Math.round((completedCount / contents.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link
            to={`/courses/${id}`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-900">{course?.title}</h1>
            <p className="text-[11px] text-slate-500">{course?.courseCode} • {completedCount} of {contents.length} completed ({progressPercent}%)</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:flex items-center space-x-3 w-48">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-slate-700">{progressPercent}%</span>
        </div>
      </div>

      {/* Main Learning Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Lesson Viewer (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {activeLesson?.moduleName}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{activeLesson?.title}</h2>
              </div>

              {activeLesson && (
                <button
                  onClick={() => handleToggleComplete(activeLesson.id)}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeLesson.isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {activeLesson.isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-1.5" />
                      Mark as Complete
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Video Player Display */}
            {activeLesson?.contentType === 'VIDEO' && activeLesson?.contentUrl && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                <iframe
                  src={activeLesson.contentUrl}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Text & Lecture Reading Content */}
            {activeLesson?.textContent && (
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-6 rounded-2xl border border-slate-100 whitespace-pre-line">
                {activeLesson.textContent}
              </div>
            )}

            {/* External / Document Links */}
            {activeLesson?.contentType === 'DOCUMENT' && activeLesson?.contentUrl && (
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Official Reading Reference</h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">{activeLesson.contentUrl}</p>
                  </div>
                </div>
                <a
                  href={activeLesson.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Open Document
                </a>
              </div>
            )}

            {/* Bottom Lesson Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                disabled={activeIndex <= 0}
                onClick={() => setActiveLesson(contents[activeIndex - 1])}
                className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous Lesson
              </button>

              <button
                disabled={activeIndex >= contents.length - 1}
                onClick={() => setActiveLesson(contents[activeIndex + 1])}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-30 hover:bg-slate-800"
              >
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Modules Sidebar Checklist (1 col) */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-4">
          <div className="font-bold text-xs text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
            <span>Course Outline</span>
            <span className="text-[11px] font-mono text-indigo-600">{contents.length} Items</span>
          </div>

          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {contents.map((lesson, idx) => {
              const isCurrent = lesson.id === activeLesson?.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start space-x-2.5 text-xs ${
                    isCurrent
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {lesson.isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </span>
                  <div className="truncate">
                    <p className="truncate leading-snug">{lesson.title}</p>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {lesson.contentType} • {lesson.durationMinutes}m
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
