import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CourseSummary } from '@/api/course';
import MessageModal from '@/components/MessageModal';

// --- Helper Functions & Sub-Components (Defined OUTSIDE for stability) ---

const renderMarkdown = (text: string) => {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
};

const NoCoursesDisplay: React.FC = () => (
    <div className="text-center py-16 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-semibold text-slate-800">No Courses Found</h3>
        <p className="mt-1 text-sm text-slate-600">Your search returned no results, or no courses are available yet.</p>
    </div>
);

type CourseCardProps = {
  course: CourseSummary;
  onHover: (course: CourseSummary | null) => void;
  isActive: boolean;
};

const CourseCard: React.FC<CourseCardProps> = ({ course, onHover, isActive }) => {
    const thumbnailUrl = course.thumbnailPath
        ? `http://localhost:8080/${course.thumbnailPath.replace(/\\/g, '/')}`
        : `https://placehold.co/400x300/6366f1/e0e7ff?text=${encodeURIComponent(course.title)}`;

    return (
        <Link to={`/learn/course/${course.id}`} onMouseEnter={() => onHover(course)} className="block group">
            <div className={`aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? 'ring-4 ring-indigo-500 ring-offset-2' : 'ring-0'}`}>
                <img src={thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h3 className="mt-4 font-bold text-slate-800 truncate group-hover:text-indigo-600" title={course.title}>{course.title}</h3>
        </Link>
    );
};

type CourseHoverDetailProps = {
  course: CourseSummary | null;
};

const CourseHoverDetail: React.FC<CourseHoverDetailProps> = ({ course }) => {
    if (!course) return null;
    const originalPrice = course.price;
    const discount = course.discountPercentage;
    let finalPrice = originalPrice;
    if (originalPrice && discount && discount > 0 && discount <= 100) {
        finalPrice = originalPrice * (1 - discount / 100);
    }
    const isFree = finalPrice !== null && finalPrice <= 0;

    return (
        <div className="p-6 bg-white rounded-2xl shadow-2xl border flex flex-col h-full">
            <p className="text-xs font-semibold text-indigo-600">{course.instructorName}</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{course.title}</h3>
            <div 
                className="mt-4 text-sm text-slate-600 prose prose-sm max-h-48 overflow-y-auto flex-grow"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(course.description) || '' }}
            />
            <div className="mt-6 pt-4 border-t">
                <div className="flex items-baseline justify-end gap-2">
                    {isFree ? ( <span className="text-3xl font-bold text-green-600">Free</span> ) : (
                        <>
                            {discount && discount > 0 && originalPrice && ( <span className="text-lg text-slate-400 line-through">₹{originalPrice.toFixed(2)}</span> )}
                            <span className="text-3xl font-bold text-slate-800">₹{finalPrice?.toFixed(2)}</span>
                        </>
                    )}
                </div>
                {discount && discount > 0 && !isFree && ( <p className="text-right text-sm font-semibold text-green-600">{discount}% off</p> )}
            </div>
            <div className="mt-4">
                {course.isEnrolled ? (
                    <Link to={`/learn/course/${course.id}`} className="block w-full text-center px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700">Continue Learning</Link>
                ) : (
                    <Link to={`/checkout/course/${course.id}`} className="block w-full text-center px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700">
                        {isFree ? 'Enroll for Free' : 'Buy Now'}
                    </Link>
                )}
            </div>
        </div>
    );
};

// --- Professional Pagination Component ---
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

// --- Main StudentDashboard Component ---
interface StudentDashboardProps {
  fullName: string;
  courses: CourseSummary[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function StudentDashboard({ fullName, courses, isLoading, currentPage, totalPages, onPageChange }: StudentDashboardProps) {
    const [modalState, setModalState] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });
    const [hoveredCourse, setHoveredCourse] = useState<CourseSummary | null>(null);

    useEffect(() => {
        if (!isLoading && courses.length > 0 && window.innerWidth >= 1024) {
            setHoveredCourse(courses[0]);
        } else {
            setHoveredCourse(null);
        }
    }, [isLoading, courses]);

    const validCourses = courses.filter(course => course && course.id != null);

    return (
        <>
            <MessageModal {...modalState} onClose={() => setModalState({ ...modalState, isVisible: false })} />
            <div className="p-4 sm:p-6 md:p-8">
                <h1 className="text-3xl font-bold text-slate-900">Course Catalog</h1>
                <p className="mt-1 text-slate-600">Welcome, {fullName}. Hover over a course to see details, or click to view.</p>
                
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                        {isLoading ? <p>Loading courses...</p> : validCourses.length > 0 ? (
                            validCourses.map(course => (
                                <CourseCard 
                                    key={course.id} 
                                    course={course} 
                                    onHover={setHoveredCourse} 
                                    isActive={hoveredCourse?.id === course.id}
                                />
                            ))
                        ) : (
                            <div className="col-span-full">
                                <NoCoursesDisplay />
                            </div>
                        )}
                    </div>
                    
                    <div className="hidden lg:block sticky top-24 transition-opacity duration-500">
                        {hoveredCourse ? (
                            <CourseHoverDetail course={hoveredCourse} />
                        ) : (
                            !isLoading && (
                                <div className="text-center p-10 text-slate-500 h-full flex items-center justify-center bg-white rounded-2xl shadow-lg border">
                                    <p>Hover over a course on the left to see details here.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
                
                <Pagination currentPage={currentPage + 1} totalPages={totalPages} onPageChange={(p) => onPageChange(p - 1)} />
            </div>
        </>
    );
}