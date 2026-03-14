import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, User } from 'lucide-react';
import ProfileHoverCard from './ProfileHoverCard';

const Navigation = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
                    <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
                        <span className="text-white">A</span>
                    </div>
                    Antigravity LMS
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/courses" className="text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
                        <BookOpen size={18} /> Explore
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link to={user.role === 'instructor' ? '/instructor' : '/dashboard'} className="text-slate-300 hover:text-white transition-colors">
                                Dashboard
                            </Link>

                            {/* Hover Profile Card - clickable to profile */}
                            <div className="relative">
                                <Link
                                    to="/profile"
                                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                                >
                                    <User size={18} /> {user.name}
                                </Link>
                                <ProfileHoverCard user={user} onLogout={handleLogout} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Sign In</Link>
                            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
