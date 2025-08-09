import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseById, updateCourse } from '@/api/course';
import type { CourseDetail, CourseData } from '@/api/course';
import DashboardNavbar from "@/components/DashboardNavbar";
import MessageModal from '@/components/MessageModal';
import CourseForm from '@/components/CourseForm'; // Import the reusable form

const EditCoursePage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [initialCourseData, setInitialCourseData] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

    // Effect to load the course data when the component mounts or courseId changes
    useEffect(() => {
        if (!courseId) {
            navigate('/dashboard'); // Redirect if no ID is present
            return;
        }
        const loadCourse = async () => {
            setIsLoading(true);
            try {
                const data = await fetchCourseById(courseId);
                setInitialCourseData(data);
            } catch (err: any) {
                setModalState({ isVisible: true, message: err.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        loadCourse();
    }, [courseId, navigate]);

    // Handler for submitting the updated form data
    const handleUpdateSubmit = async (data: CourseData, thumbnail: File | null, files: File[]) => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            // ✅ DEFINITIVE FIX: Pass all required arguments (data, thumbnail, and files) to the updateCourse function.
            const result = await updateCourse(courseId, data, thumbnail, files);
            setModalState({ isVisible: true, message: result.message, type: 'success' });
            // Navigate back to the dashboard after a short delay to show the success message
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
            setModalState({ isVisible: true, message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for when the user tries to save without making changes
    const handleNoChanges = () => {
        setModalState({ isVisible: true, message: "No changes were detected.", type: 'info' });
    };

    // Show a loading state while fetching initial data
    if (isLoading && !initialCourseData) {
        return <div className="flex items-center justify-center h-screen">Loading course...</div>;
    }

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
                            <h1 className="text-3xl font-bold text-slate-800">Editing: {initialCourseData?.title}</h1>
                            <div className="mt-6">
                                {initialCourseData ? (
                                    <CourseForm
                                        initialData={initialCourseData}
                                        onSubmit={handleUpdateSubmit}
                                        onNoChanges={handleNoChanges}
                                        isLoading={isLoading}
                                        submitButtonText="Save Changes"
                                    />
                                ) : (
                                    <p className="text-center text-red-500">
                                        Course data could not be loaded. Please try again later.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default EditCoursePage;