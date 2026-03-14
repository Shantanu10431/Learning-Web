import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Edit, Trash2, Users, BookOpen, ChevronRight, Mail, Calendar, Loader2 } from 'lucide-react';

const InstructorDash = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('courses');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', category: '', thumbnail_url: '' });

    const fetchMyCourses = async () => {
        try {
            const res = await api.get('/courses');
            setCourses(res.data.filter(c => c.instructor_id === user?.user_id || user?.role === 'admin'));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const res = await api.get('/api/admin/students');
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        }
        setStudentsLoading(false);
    };

    const fetchStudentDetails = async (studentId) => {
        try {
            const res = await api.get(`/api/admin/students/${studentId}`);
            setStudentDetails(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyCourses();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'students' && students.length === 0) {
            fetchStudents();
        }
    }, [activeTab]);

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

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        fetchStudentDetails(student.user_id);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Instructor Dashboard</h1>
                    <p className="text-slate-400">Manage your courses and track enrolled students</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2"
                >
                    <PlusCircle size={20} /> Create New Course
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${activeTab === 'courses'
                            ? 'text-indigo-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <BookOpen size={18} />
                    My Courses
                    {activeTab === 'courses' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${activeTab === 'students'
                            ? 'text-indigo-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Users size={18} />
                    Enrolled Students
                    {activeTab === 'students' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
                    )}
                </button>
            </div>

            {showCreateForm && activeTab === 'courses' && (
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

            {/* Courses Tab */}
            {activeTab === 'courses' && (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="text-indigo-400 animate-spin" />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
                            <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
                            <div className="text-slate-400 mb-4">You haven't created any courses yet.</div>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="text-indigo-400 hover:text-indigo-300"
                            >
                                Create your first course
                            </button>
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
                                                <button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors" title="Manage Lessons">
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
                </>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="flex gap-6">
                    {/* Students List */}
                    <div className="flex-1">
                        {studentsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={32} className="text-indigo-400 animate-spin" />
                            </div>
                        ) : students.length === 0 ? (
                            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
                                <Users size={48} className="text-slate-600 mx-auto mb-4" />
                                <div className="text-slate-400">No students enrolled yet.</div>
                            </div>
                        ) : (
                            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-900/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Student</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Enrolled Courses</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Joined</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {students.map(student => (
                                            <tr
                                                key={student.user_id}
                                                className={`hover:bg-slate-700/50 cursor-pointer transition-colors ${selectedStudent?.user_id === student.user_id ? 'bg-indigo-600/20' : ''}`}
                                                onClick={() => handleStudentClick(student)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {student.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-white font-medium">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400">{student.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className="bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded text-sm font-medium">
                                                        {student.enrolled_courses} courses
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-sm">
                                                    {new Date(student.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <ChevronRight size={18} className="text-slate-500 inline" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Student Details Panel */}
                    {selectedStudent && (
                        <div className="w-96 bg-slate-800 rounded-xl border border-slate-700 p-6 h-fit sticky top-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                                    {selectedStudent.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                                    <p className="text-slate-400 text-sm flex items-center gap-1">
                                        <Mail size={14} /> {selectedStudent.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                <Calendar size={14} />
                                Joined {new Date(selectedStudent.created_at).toLocaleDateString()}
                            </div>

                            <h4 className="text-lg font-bold text-white mb-4">Enrolled Courses</h4>

                            {studentDetails?.courses?.length > 0 ? (
                                <div className="space-y-3">
                                    {studentDetails.courses.map(course => (
                                        <div key={course.course_id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                            <h5 className="text-white font-medium mb-2">{course.title}</h5>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">{course.category}</span>
                                                <span className="text-indigo-400">₹{course.price}</span>
                                            </div>
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                    <span>Progress</span>
                                                    <span>{course.lessons_completed || 0}/{course.total_lessons || 0} lessons</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${course.total_lessons ? ((course.lessons_completed || 0) / course.total_lessons * 100) : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-slate-500">
                                                Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-400 text-sm">This student hasn't enrolled in any courses yet.</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InstructorDash;
