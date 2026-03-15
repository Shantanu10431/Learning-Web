import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, PlayCircle, Award, Download } from 'lucide-react';

const CertificateModal = ({ course, user, onClose }) => {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificate of Completion - ${course?.title || 'Course'}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Inter', sans-serif; 
                        background: #fff; 
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 40px;
                    }
                    .certificate {
                        width: 100%;
                        max-width: 800px;
                        border: 8px solid #6366f1;
                        padding: 60px;
                        text-align: center;
                        position: relative;
                    }
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        right: 20px;
                        bottom: 20px;
                        border: 2px solid #6366f1;
                        pointer-events: none;
                    }
                    .header { font-size: 14px; color: #6366f1; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; }
                    .title { font-family: 'Playfair Display', serif; font-size: 48px; color: #1e293b; margin-bottom: 10px; }
                    .subtitle { font-size: 18px; color: #64748b; margin-bottom: 40px; }
                    .recipient { font-family: 'Playfair Display', serif; font-size: 36px; color: #6366f1; margin-bottom: 20px; }
                    .course-label { font-size: 14px; color: #94a3b8; margin-bottom: 8px; }
                    .course-name { font-size: 24px; color: #1e293b; font-weight: 600; margin-bottom: 40px; }
                    .date { font-size: 14px; color: #94a3b8; }
                    .footer { margin-top: 40px; display: flex; justify-content: space-between; padding-top: 30px; border-top: 1px solid #e2e8f0; }
                    .signature { text-align: center; }
                    .signature-line { width: 200px; border-top: 1px solid #1e293b; margin-top: 8px; }
                    .badge { 
                        position: absolute; 
                        top: -20px; 
                        right: 40px; 
                        background: #6366f1; 
                        color: white; 
                        padding: 8px 20px; 
                        border-radius: 20px;
                        font-weight: 600;
                    }
                    @media print {
                        body { padding: 0; }
                        .certificate { border: 4px solid #6366f1; }
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="badge">COMPLETED</div>
                    <div class="header">Antigravity Learning</div>
                    <div class="title">Certificate of Completion</div>
                    <div class="subtitle">This is to certify that</div>
                    <div class="recipient">${user?.name || 'Student'}</div>
                    <div class="course-label">has successfully completed the course</div>
                    <div class="course-name">${course?.title || 'Course Name'}</div>
                    <div class="date">Issued on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div class="footer">
                        <div class="signature">
                            <div class="signature-line"></div>
                            <div>Course Instructor</div>
                        </div>
                        <div class="signature">
                            <div class="signature-line"></div>
                            <div>Platform Director</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Certificate of Completion</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-8 bg-white">
                    <div style={{ border: '8px solid #6366f1', padding: '40px', textAlign: 'center', position: 'relative', background: '#fff' }}>
                        <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '2px solid #6366f1', pointerEvents: 'none' }}></div>
                        <div style={{ fontSize: '12px', color: '#6366f1', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '15px' }}>ANTIGRAVITY LEARNING</div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: '#1e293b', marginBottom: '8px' }}>Certificate of Completion</div>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '30px' }}>This is to certify that</div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#6366f1', marginBottom: '15px' }}>{user?.name || 'Student'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>has successfully completed the course</div>
                        <div style={{ fontSize: '18px', color: '#1e293b', fontWeight: '600', marginBottom: '30px' }}>{course?.title || 'Course Name'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Issued on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Close</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [certificateCourse, setCertificateCourse] = useState(null);

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
        <>
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
                                    {course.progress === 100 && (
                                        <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1.5">
                                            <Award size={16} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-wide">{course.category || 'General'}</div>
                                    <h3 className="text-xl font-bold text-white mb-4 line-clamp-1">{course.title}</h3>

                                    <div className="mt-auto">
                                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                                            <span>Progress</span>
                                            <span className={course.progress === 100 ? 'text-emerald-400' : ''}>{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-900 rounded-full h-2.5 mb-6 border border-slate-700">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                to={`/learn/${course.course_id}/${course.last_lesson_id || course.sections?.[0]?.lessons?.[0]?.lesson_id || ''}`}
                                                className="flex-1 flex justify-center items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-medium py-2.5 rounded-lg border border-indigo-500/30 transition-colors"
                                            >
                                                <PlayCircle size={18} /> {course.progress > 0 ? 'Resume' : 'Start'}
                                            </Link>
                                            {course.progress === 100 && (
                                                <button
                                                    onClick={() => setCertificateCourse(course)}
                                                    className="px-4 py-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm font-medium"
                                                    title="Download Certificate"
                                                >
                                                    <Award size={18} />
                                                </button>
                                            )}
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

            {certificateCourse && (
                <CertificateModal
                    course={certificateCourse}
                    user={user}
                    onClose={() => setCertificateCourse(null)}
                />
            )}
        </>
    );
};

export default Dashboard;
