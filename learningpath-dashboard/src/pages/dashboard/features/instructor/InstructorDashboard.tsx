import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { deleteCourse } from '@/api/course';
import type { CourseSummary } from '@/api/course';
import MessageModal from '@/components/MessageModal';

// --- Sub-Components (Defined OUTSIDE for stability) ---

const NoCoursesDisplay: React.FC = () => (
    <div className="text-center py-16 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-semibold text-slate-800">No Courses Found</h3>
        <p className="mt-1 text-sm text-slate-600">You haven't created any courses yet, or your search returned no results.</p>
        <Link to="/create-course" className="mt-6 inline-block px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700">
            Create Your First Course
        </Link>
    </div>
);

const ActionMenu = ({ course, onDelete }: { course: CourseSummary, onDelete: (id: number, title: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={handleMenuToggle} className="p-2 rounded-full hover:bg-slate-100">
                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border z-10 origin-top-right animate-fade-in-down">
                    <div className="p-2">
                        <Link to={`/instructor/course/${course.id}/dashboard`} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 hover:text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            Analytics
                        </Link>
                        <Link to={`/edit-course/${course.id}`} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 hover:text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                            Edit
                        </Link>
                        <button onClick={() => { onDelete(course.id, course.title); setIsOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-red-50 hover:text-red-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CourseCard: React.FC<{ course: CourseSummary, onDelete: (id: number, title: string) => void }> = ({ course, onDelete }) => {
    const thumbnailUrl = course.thumbnailPath
        ? `http://localhost:8080/${course.thumbnailPath.replace(/\\/g, '/')}`
        : `https://placehold.co/600x400/1e293b/e2e8f0?text=${encodeURIComponent(course.title)}`;

    const originalPrice = course.price;
    const discount = course.discountPercentage;
    let finalPrice = originalPrice;

    if (originalPrice && discount && discount > 0 && discount <= 100) {
        finalPrice = originalPrice * (1 - discount / 100);
    }
    const isFree = finalPrice !== null && finalPrice <= 0;

    return (
        <div className="bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
            <div className="relative overflow-hidden rounded-t-2xl">
                <Link to={`/edit-course/${course.id}`} className="block">
                    <img src={thumbnailUrl} alt={course.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => (e.currentTarget.src = `https://placehold.co/600x400/e0e7ff/4338ca?text=Image+Error`)} />
                </Link>
                <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">
                    DRAFT
                </div>
            </div>
            <div className="p-6">
                <h4 className="font-bold text-xl text-slate-900 truncate" title={course.title}>{course.title}</h4>
                
                <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
                    <div className="flex items-center gap-1.5" title={`${course.moduleCount} modules`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z"></path></svg>
                        <span>{course.moduleCount || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={`${course.enrollmentCount} students enrolled`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 001 15v3h3v-3a5.973 5.973 0 00-1.25-3.906z"></path></svg>
                        <span>{course.enrollmentCount || 0} Students</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        {isFree ? (
                            <span className="text-xl font-bold text-green-600">Free</span>
                        ) : (
                            <>
                                <span className="text-xl font-bold text-slate-800">₹{finalPrice?.toFixed(2)}</span>
                                {discount && discount > 0 && originalPrice && (
                                    <span className="text-sm text-slate-400 line-through">₹{originalPrice.toFixed(2)}</span>
                                )}
                            </>
                        )}
                    </div>
                    <ActionMenu course={course} onDelete={onDelete} />
                </div>
            </div>
        </div>
    );
};

// ✅ DEFINITIVE FIX: The Pagination component is now included in this file.
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
            </button>
            {pageNumbers.map(number => (
                <button key={number} onClick={() => onPageChange(number)} className={`px-4 py-2 text-sm font-medium rounded-lg border ${currentPage === number ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>
                    {number}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </nav>
    );
};

// The props that this component will receive from its parent Dashboard
interface InstructorDashboardProps {
  fullName: string;
  courses: CourseSummary[];
  isLoading: boolean;
  onCourseDeleted: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function InstructorDashboard({ fullName, courses, isLoading, onCourseDeleted, currentPage, totalPages, onPageChange }: InstructorDashboardProps) {
    const [modalState, setModalState] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

    const handleDeleteClick = (id: number, title: string) => {
        if (window.confirm(`Are you sure you want to delete the course "${title}"? This action cannot be undone.`)) {
            handleDeleteCourse(id);
        }
    };
    
    const handleDeleteCourse = async (id: number) => {
        try {
            const result = await deleteCourse(id);
            setModalState({ isVisible: true, message: result.message, type: 'success' });
            onCourseDeleted(); 
        } catch (err: any) {
            setModalState({ isVisible: true, message: err.message, type: 'error' });
        }
    };

    const validCourses = courses.filter(course => course && course.id != null);

    return (
        <>
            <MessageModal {...modalState} onClose={() => setModalState({ ...modalState, isVisible: false })} />
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
                        <p className="mt-1 text-slate-600">Welcome back, {fullName}. Manage your courses below.</p>
                    </div>
                    <Link to="/create-course" className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg className="-ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                        Create Course
                    </Link>
                </div>
                <div className="mt-8">
                    {isLoading ? <p>Loading courses...</p> : validCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {validCourses.map(course => <CourseCard key={course.id} course={course} onDelete={handleDeleteClick} />)}
                        </div>
                    ) : (
                        <NoCoursesDisplay />
                    )}
                </div>
                <Pagination currentPage={currentPage + 1} totalPages={totalPages} onPageChange={(p) => onPageChange(p - 1)} />
            </div>
        </>
    );
}