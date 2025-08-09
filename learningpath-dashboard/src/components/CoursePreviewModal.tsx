import React, { useState, useEffect } from 'react';
import { fetchCourseById } from '@/api/course';
import type { CourseSummary, CourseDetail } from '@/api/course';


const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

interface CoursePreviewModalProps {
    courseSummary: CourseSummary;
    onClose: () => void;
    onEnroll: (id: number, title: string) => void;
}

const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({ courseSummary, onClose, onEnroll }) => {
    const [details, setDetails] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetchCourseById(courseSummary.id.toString())
            .then(setDetails)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [courseSummary.id]);

    const thumbnailUrl = courseSummary.thumbnailPath
        ? `http://localhost:8080/${courseSummary.thumbnailPath.replace(/\\/g, '/')}`
        : `https://placehold.co/1200x600/6366f1/e0e7ff?text=${encodeURIComponent(courseSummary.title)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                <img src={thumbnailUrl} alt={courseSummary.title} className="w-full h-64 object-cover rounded-t-2xl flex-shrink-0" />
                <div className="p-8 flex-grow">
                    <h2 className="text-3xl font-bold text-slate-900">{courseSummary.title}</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">By {courseSummary.instructorName}</p>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 mt-4 border-t border-b py-2">
                        <span><strong>Created:</strong> {formatDate(courseSummary.createdAt)}</span>
                        <span><strong>Last Updated:</strong> {formatDate(courseSummary.updatedAt)}</span>
                    </div>

                    <p className="text-slate-700 mt-4">{courseSummary.description}</p>
                    
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Course Curriculum</h3>
                        {isLoading || !details ? <p className="mt-4 text-slate-500">Loading curriculum...</p> : (
                            <ul className="mt-4 space-y-3">
                                {details.modules.map((module, index) => (
                                    <li key={module.id} className={`p-4 rounded-lg transition-colors ${index === 0 ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-slate-800">{module.title}</h4>
                                            {index > 0 && 
                                                <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"></path></svg>
                                                    LOCKED
                                                </div>
                                            }
                                        </div>
                                        <ul className="mt-2 pl-4 space-y-1 text-sm border-l-2 ${index === 0 ? 'border-indigo-200' : 'border-slate-200'}">
                                            {module.resources.map(resource => (
                                                <li key={resource.id} className="flex items-center gap-2 py-1">
                                                    <svg className={`w-4 h-4 flex-shrink-0 ${index === 0 ? 'text-indigo-500' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                    <span className={`${index === 0 ? 'text-slate-700' : 'text-slate-500'}`}>{resource.title}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className="p-8 pt-4 border-t bg-slate-50 rounded-b-2xl flex-shrink-0">
                    <button onClick={() => onEnroll(courseSummary.id, courseSummary.title)} className="w-full px-8 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        Enroll to Unlock All Modules
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoursePreviewModal;
    