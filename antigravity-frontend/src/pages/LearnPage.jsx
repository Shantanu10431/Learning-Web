import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import VideoPlayer from '../components/VideoPlayer';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Menu, Lock } from 'lucide-react';

const LearnPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [completedLessons, setCompletedLessons] = useState([]);
    const [progressPercent, setProgressPercent] = useState(0);
    const [resumeTime, setResumeTime] = useState(0);

    const fetchProgress = async () => {
        try {
            const progRes = await api.get(`/progress/${courseId}`);
            setCompletedLessons(progRes.data);
            const percRes = await api.get(`/progress/${courseId}/percentage`);
            setProgressPercent(percRes.data.percentage || 0);
        } catch (e) { }
    };

    const fetchLessonLockAndResume = async (lId) => {
        try {
            console.log('Fetching lesson:', lId);

            // Get lesson data from the course tree that's already loaded
            let lessonData = null;
            if (course && course.sections) {
                for (const section of course.sections) {
                    const found = section.lessons?.find(l => l.lesson_id === lId);
                    if (found) {
                        lessonData = found;
                        break;
                    }
                }
            }

            if (!lessonData) {
                // Fallback: try the API if not found in course tree
                try {
                    const lessonRes = await api.get(`/lessons/${lId}`);
                    lessonData = lessonRes.data;
                } catch (e) {
                    console.error('Lesson not found in course tree or API');
                }
            }

            if (!lessonData) {
                setError('Lesson not found');
                return;
            }

            console.log('Lesson data from tree:', lessonData);
            setCurrentLesson(lessonData);

            // Try to get resume time
            try {
                const progRes = await api.get(`/progress/videos/${lId}`);
                setResumeTime(progRes.data.last_position_seconds || 0);
            } catch (e) {
                console.log('No progress found');
            }
        } catch (err) {
            console.error('Error fetching lesson:', err);
            setError('Failed to load lesson: ' + err.message);
        }
    };

    useEffect(() => {
        const fetchCourseAndLesson = async () => {
            try {
                console.log('Fetching course tree for:', courseId);
                const courseRes = await api.get(`/courses/${courseId}/tree`);
                console.log('Course tree response:', courseRes.data);
                setCourse(courseRes.data);

                let targetLessonId = lessonId;
                if (!targetLessonId) {
                    targetLessonId = courseRes.data.sections?.[0]?.lessons?.[0]?.lesson_id;
                    if (targetLessonId) {
                        navigate(`/learn/${courseId}/${targetLessonId}`, { replace: true });
                        return;
                    }
                }

                if (targetLessonId) {
                    // Get lesson from course tree - SYNCHRONOUS (already in memory)
                    let lessonFromTree = null;
                    if (courseRes.data && courseRes.data.sections) {
                        for (const section of courseRes.data.sections) {
                            const found = section.lessons?.find(l => l.lesson_id === targetLessonId);
                            if (found) {
                                lessonFromTree = found;
                                break;
                            }
                        }
                    }

                    if (lessonFromTree) {
                        console.log('Lesson from tree:', lessonFromTree);
                        setCurrentLesson(lessonFromTree);
                        // Fire progress fetch in background, don't wait
                        api.get(`/progress/videos/${targetLessonId}`)
                            .then(progRes => setResumeTime(progRes.data.last_position_seconds || 0))
                            .catch(() => { });
                    } else {
                        // Fallback to API - but set loading false first
                        try {
                            const lessonRes = await api.get(`/lessons/${targetLessonId}`);
                            if (lessonRes.data) {
                                setCurrentLesson(lessonRes.data);
                                const progRes = await api.get(`/progress/videos/${targetLessonId}`);
                                setResumeTime(progRes.data.last_position_seconds || 0);
                            }
                        } catch (e) {
                            console.error('Lesson API failed:', e);
                        }
                    }
                }
            } catch (err) {
                console.error('Full error:', err);
                console.error('Error response:', err.response?.data);
                if (err.response?.status === 402) {
                    setError('Payment required to access this course. Please complete enrollment.');
                } else if (err.response?.status === 403) {
                    setError('You are not enrolled in this course. Please enroll first.');
                } else if (err.response?.status === 404) {
                    setError('Course not found.');
                } else {
                    setError('Failed to load course: ' + (err.response?.data?.error || err.message));
                }
            }
            setLoading(false);
            // Fire progress fetch in background
            api.get(`/progress/${courseId}`)
                .then(progRes => {
                    setCompletedLessons(progRes.data);
                    return api.get(`/progress/${courseId}/percentage`);
                })
                .then(percRes => setProgressPercent(percRes.data.percentage || 0))
                .catch(() => { });
        };
        fetchCourseAndLesson();
    }, [courseId, lessonId, navigate]);

    const handleProgress = async (seconds) => {
        if (!currentLesson?.lesson_id) return;
        try {
            await api.post(`/progress/${currentLesson.lesson_id}`, {
                course_id: courseId,
                last_position_seconds: seconds,
            });
        } catch (e) { }
    };

    const handleMarkComplete = async (seconds) => {
        if (!currentLesson?.lesson_id) return;
        try {
            await api.post(`/progress/${currentLesson.lesson_id}`, {
                course_id: courseId,
                last_position_seconds: seconds || 0,
                is_completed: true
            });
            fetchProgress();

            if (currentLesson.next_lesson_id) {
                navigate(`/learn/${courseId}/${currentLesson.next_lesson_id}`);
            }
        } catch (err) {
            console.error('Failed to mark complete');
        }
    };

    if (!course) return <div className="p-8 text-slate-400">Loading course...</div>;
    if (error) return (
        <div className="p-12 text-center max-w-2xl mx-auto mt-20 bg-slate-800 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-red-400 mb-8">{error}</p>
            <Link to={`/courses/${courseId}`} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Return to Course Overview
            </Link>
        </div>
    );
    if (!currentLesson) return <div className="p-8 text-slate-400">Loading lesson...</div>;

    const prevLessonId = currentLesson.previous_lesson_id;
    const nextLessonId = currentLesson.next_lesson_id;

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
                    <VideoPlayer
                        youtubeUrl={currentLesson.youtube_url}
                        isLocked={currentLesson.locked}
                        startPositionSeconds={resumeTime}
                        onProgress={handleProgress}
                        onCompleted={handleMarkComplete}
                    />
                </div>

                <div className="p-6 md:p-8 flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentLesson.title}</h1>
                            <p className="text-slate-400">Course: {course.title}</p>
                        </div>

                        <button
                            onClick={() => handleMarkComplete(resumeTime)}
                            disabled={completedLessons.some(id => String(id) === String(lessonId))}
                            className={`${completedLessons.some(id => String(id) === String(lessonId)) ? 'bg-slate-800 text-emerald-400 cursor-default' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap border border-transparent ${completedLessons.some(id => String(id) === String(lessonId)) ? 'border-emerald-500/30' : ''} disabled:opacity-50`}
                        >
                            <CheckCircle size={20} /> {completedLessons.some(id => String(id) === String(lessonId)) ? 'Completed' : 'Mark Complete'}
                        </button>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                        <h3 className="text-lg font-medium text-white mb-2">Lesson Material</h3>
                        <p className="text-slate-400 whitespace-pre-wrap">{currentLesson.description || 'No additional notes provided for this lesson.'}</p>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-800">
                        {prevLessonId ? (
                            <Link to={`/learn/${courseId}/${prevLessonId}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft size={20} /> <span className="hidden sm:inline">Previous Lesson</span>
                            </Link>
                        ) : <div></div>}

                        {nextLessonId ? (
                            <Link to={`/learn/${courseId}/${nextLessonId}`} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
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
                                            to={lesson.locked ? '#' : `/learn/${courseId}/${lesson.lesson_id}`}
                                            onClick={(e) => {
                                                if (lesson.locked) e.preventDefault();
                                                else if (window.innerWidth < 768) setIsSidebarOpen(false);
                                            }}
                                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-400' : lesson.locked ? 'text-slate-500 opacity-60 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                {isCompleted ? <CheckCircle size={16} className="text-emerald-500" /> : lesson.locked ? <Lock size={16} className="text-slate-600" /> : <Circle size={16} className="text-slate-600" />}
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
