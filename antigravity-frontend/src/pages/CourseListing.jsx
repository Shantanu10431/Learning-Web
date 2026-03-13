import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { Search } from 'lucide-react';

const CourseListing = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/courses');
                setCourses(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchCourses();
    }, []);

    return (
        <div className="py-12 px-6">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Explore Courses</h1>
                    <p className="text-slate-400">Discover top-quality courses and start learning today.</p>
                </div>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-slate-400 text-center py-20">Loading courses...</div>
            ) : courses.length === 0 ? (
                <div className="text-slate-400 text-center py-20 bg-slate-800 rounded-xl border border-slate-700">No courses available right now.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => <CourseCard key={course.course_id} course={course} />)}
                </div>
            )}
        </div>
    );
};

export default CourseListing;
