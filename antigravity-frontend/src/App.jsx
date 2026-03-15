import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InstructorDash from './pages/InstructorDash';
import CourseListing from './pages/CourseListing';
import CourseDetails from './pages/CourseDetails';
import LearnPage from './pages/LearnPage';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AIChatbot from './components/AIChatbot';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-slate-900 border-t border-slate-800">
                    <Navigation />
                    <main className="max-w-7xl mx-auto">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Navigate to="/courses" replace />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/courses" element={<CourseListing />} />
                            <Route path="/courses/:id" element={<CourseDetails />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />

                            <Route path="/instructor" element={
                                <ProtectedRoute roles={['instructor', 'admin']}>
                                    <InstructorDash />
                                </ProtectedRoute>
                            } />

                            <Route path="/learn/:courseId" element={
                                <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                                    <LearnPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/learn/:courseId/:lessonId" element={
                                <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                                    <LearnPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/profile" element={
                                <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                        </Routes>
                        <AIChatbot />
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
