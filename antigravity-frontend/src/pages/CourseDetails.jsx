import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { PlayCircle, Clock, BookOpen, User } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const CourseDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${id}`);
                setCourse(res.data);

                if (user) {
                    try {
                        const enrollRes = await api.get(`/enrollments/${id}`);
                        setIsEnrolled(enrollRes.data.isEnrolled);
                    } catch (e) { }
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchCourse();
    }, [id, user]);

    const handleEnroll = async () => {
        console.log('Enroll clicked, user:', user, 'course price:', course.price);

        if (!user) {
            navigate('/login');
            return;
        }

        const price = parseFloat(course.price) || 0;
        console.log('Parsed price:', price);

        if (price > 0) {
            console.log('Opening payment modal');
            setIsPaymentModalOpen(true);
            return;
        }

        processEnrollment();
    };

    const processEnrollment = async () => {
        console.log('Processing enrollment for course:', id);
        setEnrolling(true);
        try {
            const price = parseFloat(course.price) || 0;
            console.log('Course price:', price);

            // For free courses, enroll directly
            if (price === 0) {
                console.log('Enrolling in free course');
                await api.post(`/enroll/${id}`);
                setIsEnrolled(true);
            } else {
                console.log('Course is paid, opening payment modal');
                setIsPaymentModalOpen(true);
            }
        } catch (err) {
            console.error('Enrollment error:', err);
            // Check if already enrolled
            if (err.response?.data?.error === 'Already enrolled and paid' || err.response?.data?.message === 'Already enrolled and paid') {
                setIsEnrolled(true);
            } else {
                alert('Failed to enroll: ' + (err.response?.data?.error || err.message));
            }
        }
        setEnrolling(false);
        setIsPaymentModalOpen(false);
    };

    // Handle successful payment
    const handlePaymentComplete = async () => {
        console.log('Payment completed, recording payment');
        try {
            // Record payment
            const response = await api.post(`/record-payment/${id}`, {
                paymentId: `PAY${Date.now()}`,
                amount: course.price
            });
            console.log('Payment recorded:', response.data);
            setIsEnrolled(true);
            setIsPaymentModalOpen(false);
        } catch (err) {
            console.error('Payment recording error:', err);
            // Still allow access for demo purposes
            setIsEnrolled(true);
            setIsPaymentModalOpen(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading...</div>;
    if (!course) return <div className="p-8 text-red-400">Course not found.</div>;

    const totalLessons = course.sections?.reduce((sum, sec) => sum + (sec.lessons?.length || 0), 0) || 0;
    const price = parseFloat(course.price) || 0;
    const isPaidCourse = price > 0;

    console.log('Rendering - price:', price, 'isPaidCourse:', isPaidCourse, 'isEnrolled:', isEnrolled);

    return (
        <div className="py-12 px-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8">
                <div className="h-64 md:h-80 w-full relative">
                    <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex items-end p-8">
                        <div>
                            <div className="text-indigo-400 font-medium mb-2 uppercase tracking-wider text-sm">{course.category}</div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{course.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-slate-300">
                                <span className="flex items-center gap-2"><User size={18} /> {course.instructor_name}</span>
                                <span className="flex items-center gap-2"><BookOpen size={18} /> {totalLessons} Lessons</span>
                                <span className="flex items-center gap-2"><Clock size={18} /> Self-paced</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-slate-800 rounded-xl p-8 border border-slate-700">
                        <h2 className="text-2xl font-bold text-white mb-4">About this course</h2>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{course.description}</p>
                    </section>

                    <section className="bg-slate-800 rounded-xl p-8 border border-slate-700">
                        <h2 className="text-2xl font-bold text-white mb-6">Course Syllabus</h2>
                        {course.sections?.map((section, idx) => (
                            <div key={section.section_id} className="mb-6 last:mb-0">
                                <h3 className="text-lg font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2">
                                    Section {idx + 1}: {section.title}
                                </h3>
                                <ul className="space-y-2">
                                    {section.lessons?.map((lesson, lIdx) => (
                                        <li key={lesson.lesson_id} className="flex items-center gap-3 text-slate-400 p-3 hover:bg-slate-900/50 rounded-lg transition-colors">
                                            <PlayCircle size={16} className="text-indigo-400 flex-shrink-0" />
                                            <div>
                                                <span className="text-slate-300 block">{lIdx + 1}. {lesson.title}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </section>
                </div>

                <div>
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 sticky top-6">
                        <div className="text-3xl font-bold text-white mb-6">
                            {isEnrolled ? "You're Enrolled!" : (isPaidCourse ? `₹${price.toFixed(0)}` : "Free Enrollment")}
                        </div>

                        {isEnrolled ? (
                            <Link to={`/learn/${course.course_id}/${course.sections?.[0]?.lessons?.[0]?.lesson_id || ''}`} className="block text-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-lg transition-colors text-lg">
                                Go to Course
                            </Link>
                        ) : user ? (
                            <button onClick={handleEnroll} disabled={enrolling} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-lg transition-colors text-lg flex items-center justify-center">
                                {enrolling ? 'Enrolling...' : (isPaidCourse ? 'Buy Now' : 'Enroll for Free')}
                            </button>
                        ) : (
                            <Link to="/login" className="block text-center w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-4 rounded-lg transition-colors text-lg">
                                Sign In to Enroll
                            </Link>
                        )}

                        <div className="space-y-4 mt-8 text-slate-300 text-sm border-t border-slate-700 pt-6">
                            <div className="flex items-center gap-3"><BookOpen size={18} className="text-indigo-400" /> Full lifetime access</div>
                            <div className="flex items-center gap-3"><PlayCircle size={18} className="text-indigo-400" /> Access on mobile and TV</div>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                courseTitle={course.title}
                price={course.price}
                onComplete={handlePaymentComplete}
            />
        </div>
    );
};

export default CourseDetails;
