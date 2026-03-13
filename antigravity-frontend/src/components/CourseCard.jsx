import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 transition-colors">
            <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'} alt={course.title} className="w-full h-48 object-cover" />
            <div className="p-6">
                <div className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-wide">{course.category || 'General'}</div>
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-500">By {course.instructor_name}</span>
                        <span className="text-lg font-bold text-emerald-400 mt-1">
                            {course.price > 0 ? `₹${course.price}` : 'Free'}
                        </span>
                    </div>
                    <Link to={`/courses/${course.course_id}`} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm bg-indigo-600/10 px-3 py-2 rounded-lg mt-1">View Details</Link>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
