// src/pages/course/CreateCoursePage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '@/api/course';
import type { CourseData } from '@/api/course';
import DashboardNavbar from "@/components/DashboardNavbar";
import MessageModal from '@/components/MessageModal';
import CourseForm from '@/components/CourseForm'; // Import the reusable form

const CreateCoursePage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [modalState, setModalState] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

    const handleCreateSubmit = async (data: CourseData, thumbnail: File | null, files: File[]) => {
        setIsLoading(true);
        try {
            const result = await createCourse(data, thumbnail, files);
            setModalState({ isVisible: true, message: result.message, type: 'success' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
            setModalState({ isVisible: true, message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // This handler is required by the form but is unlikely to be called on a create page.
    const handleNoChanges = () => {
        setModalState({ isVisible: true, message: "Please fill out the form to create a course.", type: 'info' });
    };

    return (
        <>
            <MessageModal 
                {...modalState} 
                onClose={() => setModalState({ ...modalState, isVisible: false })} 
            />
            <div className="min-h-screen bg-gray-100">
                <DashboardNavbar />
                <main className="py-10">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <h1 className="text-3xl font-bold text-slate-800">Create a New Course</h1>
                            <div className="mt-6">
                                <CourseForm
                                    onSubmit={handleCreateSubmit}
                                    onNoChanges={handleNoChanges}
                                    isLoading={isLoading}
                                    submitButtonText="Publish Course"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default CreateCoursePage;