// src/pages/course/CheckoutPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCourseById, enrollInCourse } from '@/api/course';
import type { CourseDetail } from '@/api/course';
import DashboardNavbar from "@/components/DashboardNavbar";
import MessageModal from '@/components/MessageModal';

const CheckoutPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [modalState, setModalState] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

    useEffect(() => {
        if (!courseId) {
            navigate('/dashboard');
            return;
        }
        fetchCourseById(courseId)
            .then(data => {
                if (data.isEnrolled) {
                    navigate(`/learn/course/${courseId}`);
                } else {
                    setCourse(data);
                }
            })
            .catch(err => setModalState({ isVisible: true, message: err.message, type: 'error' }))
            .finally(() => setIsLoading(false));
    }, [courseId, navigate]);

    const handleEnroll = async () => {
        if (!courseId) return;
        setIsEnrolling(true);
        try {
            const result = await enrollInCourse(Number(courseId));
            setModalState({ isVisible: true, message: "Enrollment successful! Redirecting to your courses...", type: 'success' });
            
            // ✅ DEFINITIVE FIX: Navigate to "My Courses" for a better UX and to ensure fresh data.
            setTimeout(() => navigate(`/my-courses`), 2000);

        } catch (err: any) {
            setModalState({ isVisible: true, message: err.message, type: 'error' });
            setIsEnrolling(false);
        }
    };

    if (isLoading) return <div className="text-center p-10">Loading checkout...</div>;
    if (!course) return <div className="text-center p-10">Could not load course details.</div>;

    const finalPrice = (course.price || 0) * (1 - (course.discountPercentage || 0) / 100);

    return (
        <>
            <MessageModal {...modalState} onClose={() => setModalState({ ...modalState, isVisible: false })} />
            <div className="min-h-screen bg-slate-50">
                <DashboardNavbar />
                <main className="max-w-4xl mx-auto py-10 px-4">
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <h1 className="text-3xl font-bold text-slate-800">Complete Your Enrollment</h1>
                        <div className="mt-6 p-6 border rounded-xl flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-xl text-slate-900">{course.title}</h2>
                                <p className="text-sm text-slate-600">You are about to enroll in this course.</p>
                            </div>
                            <div className="text-right">
                                {course.discountPercentage && course.discountPercentage > 0 && (
                                    <p className="text-sm text-slate-500 line-through">₹{course.price?.toFixed(2)}</p>
                                )}
                                <p className="text-2xl font-bold text-indigo-600">
                                    {finalPrice > 0 ? `₹${finalPrice.toFixed(2)}` : 'Free'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <p className="text-center text-sm text-slate-500 mb-4">This is a simulated payment page. No payment will be processed.</p>
                            <button 
                                onClick={handleEnroll} 
                                disabled={isEnrolling}
                                className="w-full py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
                            >
                                {isEnrolling ? 'Processing...' : 'Confirm Enrollment'}
                            </button>
                            <Link to={`/learn/course/${course.id}`} className="block text-center mt-4 text-sm text-slate-600 hover:underline">
                                Go back to course preview
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default CheckoutPage;