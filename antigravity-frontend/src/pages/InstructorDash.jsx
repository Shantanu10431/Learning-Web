import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const InstructorDash = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', category: '', thumbnail_url: '' });

    const fetchMyCourses = async () => {
        try {
            // In a real app we'd have a specific endpoint for instructor's courses
            // For now, fetch all and filter client side
            const res = await api.get('/courses');
            setCourses(res.data.filter(c => c.instructor_id === user?.user_id || user?.role === 'admin'));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMyCourses();
    }, [user]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', { ...formData, is_published: true });
            setFormData({ title: '', description: '', category: '', thumbnail_url: '' });
            setShowCreateForm(false);
            fetchMyCourses();
        } catch (err) {
            console.error(err);
            alert('Failed to create course');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchMyCourses();
        } catch (err) {
            console.error(err);
            alert('Failed to delete course');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Instructor Dashboard</h1>
                    <p className="text-slate-400">Manage your courses and content</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2"
                >
                    <PlusCircle size={20} /> Create New Course
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Create Course</h2>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Course Title</label>
                            <input required type="text" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                            <textarea required rows="3" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                <input type="text" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Thumbnail URL</label>
                                <input type="url" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={formData.thumbnail_url} onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium">Save Course</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-slate-400 py-10">Loading your courses...</div>
            ) : courses.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
                    <div className="text-slate-400 mb-4">You haven't created any courses yet.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.course_id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                            <div className="h-40 relative">
                                <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} alt={course.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-slate-900/80 rounded px-2 py-1 text-xs font-medium text-indigo-400">
                                    {course.is_published ? 'Published' : 'Draft'}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                                <div className="mt-auto flex justify-between items-center border-t border-slate-700 pt-4">
                                    <span className="text-xs text-slate-500">{new Date(course.created_at).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors" title="Manage Lessons (Not implemented in MVP view)">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteCourse(course.course_id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete Course">
                                            <Trash2 size={16} />
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

export default InstructorDash;
