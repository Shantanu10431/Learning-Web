import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { Search, X, Loader2 } from 'lucide-react';

const CourseListing = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/courses');
                setCourses(res.data);
                setFilteredCourses(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchCourses();
    }, []);

    // Search functionality
    useEffect(() => {
        const searchCourses = async () => {
            if (!searchQuery.trim()) {
                setFilteredCourses(courses);
                return;
            }

            setSearching(true);
            try {
                const res = await api.get(`/courses/search?q=${encodeURIComponent(searchQuery)}`);
                setFilteredCourses(res.data);
            } catch (err) {
                // Fallback to client-side search
                const query = searchQuery.toLowerCase();
                const filtered = courses.filter(course =>
                    course.title.toLowerCase().includes(query) ||
                    course.description?.toLowerCase().includes(query) ||
                    course.category?.toLowerCase().includes(query) ||
                    course.instructor_name?.toLowerCase().includes(query)
                );
                setFilteredCourses(filtered);
            }
            setSearching(false);
        };

        const debounce = setTimeout(searchCourses, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, courses]);

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredCourses(courses);
    };

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
                        placeholder="Search courses, topics, instructors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-slate-400">
                        {searching ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" /> Searching...
                            </span>
                        ) : (
                            <>Found <span className="text-indigo-400 font-bold">{filteredCourses.length}</span> courses for "<span className="text-white">{searchQuery}</span>"</>
                        )}
                    </p>
                    {filteredCourses.length > 0 && (
                        <button
                            onClick={clearSearch}
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-indigo-400 animate-spin" />
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
                    <Search size={48} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">No courses found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="text-indigo-400 hover:text-indigo-300 mt-2"
                        >
                            View all courses
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => <CourseCard key={course.course_id} course={course} />)}
                </div>
            )}
        </div>
    );
};

export default CourseListing;
