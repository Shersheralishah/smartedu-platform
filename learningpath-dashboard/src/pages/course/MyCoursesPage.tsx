import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyEnrolledCourses } from '@/api/course';
import type { CourseSummary } from '@/api/course';
import DashboardNavbar from '@/components/DashboardNavbar';
import MessageModal from '@/components/MessageModal';

const EnrolledCourseCard = ({ course }: { course: CourseSummary }) => {
    const thumbnailUrl = course.thumbnailPath
        ? `http://localhost:8080/${course.thumbnailPath.replace(/\\/g, '/')}`
        : `https://placehold.co/600x400/16a34a/e0e7ff?text=${encodeURIComponent(course.title)}`;

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="overflow-hidden">
                <img src={thumbnailUrl} alt={course.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="p-6 flex flex-col">
                <p className="text-xs font-semibold text-green-600">{course.instructorName}</p>
                <h4 className="font-bold text-xl text-slate-900 truncate mt-1" title={course.title}>{course.title}</h4>
                <div className="mt-6 flex-grow flex items-end">
                    <Link to={`/learn/course/${course.id}`} className="w-full text-center px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700">
                        Continue Learning
                    </Link>
                </div>
            </div>
        </div>
    );
};

const MyCoursesPage = () => {
    const [enrolledCourses, setEnrolledCourses] = useState<CourseSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

    useEffect(() => {
        setIsLoading(true);
        fetchMyEnrolledCourses()
            .then(setEnrolledCourses)
            .catch(err => setModalState({ isVisible: true, message: err.message, type: 'error' }))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <>
            <MessageModal {...modalState} onClose={() => setModalState({ ...modalState, isVisible: false })} />
            <div className="min-h-screen bg-slate-50">
                <DashboardNavbar />
                <main className="p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
                            <p className="mt-1 text-slate-600">Your personal learning dashboard.</p>
                        </div>
                        <Link to="/dashboard" className="mt-4 sm:mt-0 text-sm font-semibold text-indigo-600 hover:underline">
                            Browse Course Catalog &rarr;
                        </Link>
                    </div>
                    <div className="mt-8">
                        {isLoading ? <p>Loading your courses...</p> : enrolledCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {enrolledCourses.map(course => <EnrolledCourseCard key={course.id} course={course} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 bg-white rounded-2xl border">
                                <h3 className="text-lg font-semibold text-slate-800">You are not enrolled in any courses yet.</h3>
                                <p className="mt-1 text-sm text-slate-600">Explore the course catalog to start your learning journey.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default MyCoursesPage;
