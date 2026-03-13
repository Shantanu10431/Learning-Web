import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, PlayCircle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/my-courses');
                const coursesData = res.data;

                const coursesWithProgress = await Promise.all(coursesData.map(async (course) => {
                    try {
                        const [progRes, lastLessonRes] = await Promise.all([
                            api.get(`/progress/${course.course_id}/percentage`),
                            api.get(`/progress/${course.course_id}/last-lesson`)
                        ]);
                        return {
                            ...course,
                            progress: progRes.data.percentage,
                            last_lesson_id: lastLessonRes.data.last_lesson_id
                        };
                    } catch (e) {
                        return { ...course, progress: 0, last_lesson_id: null };
                    }
                }));

                setCourses(coursesWithProgress);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    const handleUnenroll = async (courseId) => {
        if (window.confirm('Are you sure you want to drop this course? All progress will be lost.')) {
            try {
                await api.delete(`/enroll/${courseId}`);
                setCourses(courses.filter(c => c.course_id !== courseId));
            } catch (err) {
                console.error('Failed to unenroll', err);
                alert('Could not unenroll.');
            }
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading your learning dashboard...</div>;

    return (
        <div className="py-12 px-6">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}</h1>
                <p className="text-slate-400">Pick up where you left off and keep learning.</p>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>

            {courses.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-10 text-center border border-slate-700">
                    <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-6">You haven't enrolled in any courses yet.</p>
                    <Link to="/courses" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                        Explore Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div key={course.course_id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                            <div className="h-40 relative">
                                <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-wide">{course.category || 'General'}</div>
                                <h3 className="text-xl font-bold text-white mb-4 line-clamp-1">{course.title}</h3>

                                <div className="mt-auto">
                                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                                        <span>Progress</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2.5 mb-6 border border-slate-700">
                                        <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/learn/${course.course_id}/${course.last_lesson_id || course.sections?.[0]?.lessons?.[0]?.lesson_id || ''}`}
                                            className="flex-1 flex justify-center items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-medium py-2.5 rounded-lg border border-indigo-500/30 transition-colors"
                                        >
                                            <PlayCircle size={18} /> {course.progress > 0 ? 'Resume' : 'Start'}
                                        </Link>
                                        <button
                                            onClick={() => handleUnenroll(course.course_id)}
                                            className="px-4 py-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors text-sm font-medium"
                                            title="Drop Course"
                                        >
                                            Drop
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
