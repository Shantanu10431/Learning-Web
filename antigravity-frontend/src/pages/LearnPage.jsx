import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import VideoPlayer from '../components/VideoPlayer';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

const LearnPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [completedLessons, setCompletedLessons] = useState([]);
    const [progressPercent, setProgressPercent] = useState(0);

    const fetchProgress = async () => {
        try {
            const progRes = await api.get(`/progress/${courseId}`);
            setCompletedLessons(progRes.data);
            const percRes = await api.get(`/progress/${courseId}/percentage`);
            setProgressPercent(percRes.data.percentage || 0);
        } catch (e) { }
    };

    useEffect(() => {
        const fetchCourseAndLesson = async () => {
            try {
                const courseRes = await api.get(`/courses/${courseId}`);
                setCourse(courseRes.data);

                let lesson = null;
                if (lessonId) {
                    const lessonRes = await api.get(`/lessons/${lessonId}`);
                    lesson = lessonRes.data;
                } else {
                    lesson = courseRes.data.sections?.[0]?.lessons?.[0];
                    if (lesson) navigate(`/learn/${courseId}/${lesson.lesson_id}`, { replace: true });
                }
                setCurrentLesson(lesson);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
            fetchProgress();
        };
        fetchCourseAndLesson();
    }, [courseId, lessonId, navigate]);

    const handleMarkComplete = async () => {
        try {
            await api.post('/progress/complete', { course_id: courseId, lesson_id: lessonId });
            fetchProgress();
        } catch (err) {
            console.error('Failed to mark complete');
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading learning environment...</div>;
    if (!course || !currentLesson) return <div className="p-8 text-red-400">Course or lesson data unavailable.</div>;

    let allLessons = [];
    course.sections?.forEach(s => s.lessons?.forEach(l => allLessons.push(l)));
    const currentIndex = allLessons.findIndex(l => l.lesson_id === lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)] border-t border-slate-800">
            <div className="md:hidden bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-white font-medium truncate pr-4">{course.title}</h2>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white">
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex-1 flex flex-col bg-slate-950">
                <div className="p-4 md:p-8 bg-black">
                    <VideoPlayer youtubeUrl={currentLesson.youtube_url} />
                </div>

                <div className="p-6 md:p-8 flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentLesson.title}</h1>
                            <p className="text-slate-400">Course: {course.title}</p>
                        </div>

                        <button
                            onClick={handleMarkComplete}
                            disabled={completedLessons.includes(lessonId)}
                            className={`${completedLessons.includes(lessonId) ? 'bg-slate-800 text-emerald-400 cursor-default' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap border border-transparent ${completedLessons.includes(lessonId) ? 'border-emerald-500/30' : ''}`}
                        >
                            <CheckCircle size={20} /> {completedLessons.includes(lessonId) ? 'Completed' : 'Mark Complete'}
                        </button>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                        <h3 className="text-lg font-medium text-white mb-2">Lesson Material</h3>
                        <p className="text-slate-400 whitespace-pre-wrap">{currentLesson.description || 'No additional notes provided for this lesson.'}</p>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-800">
                        {prevLesson ? (
                            <Link to={`/learn/${courseId}/${prevLesson.lesson_id}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft size={20} /> <span className="hidden sm:inline">Previous Lesson</span>
                            </Link>
                        ) : <div></div>}

                        {nextLesson ? (
                            <Link to={`/learn/${courseId}/${nextLesson.lesson_id}`} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                                <span className="hidden sm:inline">Next Lesson</span> <ChevronRight size={20} />
                            </Link>
                        ) : (
                            <Link to="/dashboard" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                                Finish Course <CheckCircle size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-800 overflow-y-auto max-h-[calc(100vh-73px)] shrink-0`}>
                <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-lg font-bold text-white line-clamp-2">{course.title}</h2>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Your Progress</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {course.sections?.map((section, sIdx) => (
                        <div key={section.section_id} className="mb-4">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 px-2">
                                Section {sIdx + 1}: {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.lessons?.map((lesson, lIdx) => {
                                    const isActive = lesson.lesson_id === lessonId;
                                    const isCompleted = completedLessons.includes(lesson.lesson_id);
                                    return (
                                        <Link
                                            key={lesson.lesson_id}
                                            to={`/learn/${courseId}/${lesson.lesson_id}`}
                                            onClick={() => { window.innerWidth < 768 && setIsSidebarOpen(false); }}
                                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                {isCompleted ? <CheckCircle size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-600" />}
                                            </div>
                                            <div className="text-sm">
                                                <span className={`font-medium block leading-tight mb-1 ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>{lIdx + 1}. {lesson.title}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LearnPage;
