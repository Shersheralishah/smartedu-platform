import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCourseById } from '@/api/course';
import type { CourseDetail, ResourceData } from '@/api/course';
import { getToken } from '@/hooks/useAuth';
import DashboardNavbar from "@/components/DashboardNavbar";

// A helper to get a specific icon SVG based on resource type
const getResourceIcon = (type: string) => {
    switch (type) {
        case 'PDF': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
        case 'VIDEO': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106A1 1 0 0016 8v4a1 1 0 00.553.894l2 1A1 1 0 0020 13V7a1 1 0 00-1.447-.894l-2-1z" /></svg>;
        default: return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5l3-3z" clipRule="evenodd" /></svg>;
    }
};

// Helper to convert YouTube watch URLs to embeddable URLs
const convertToEmbedUrl = (url: string): string => {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('watch')) {
            const videoId = urlObj.searchParams.get('v');
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch (error) {
        console.error("Invalid URL for embedding:", url);
        return url;
    }
    return url;
};

const CourseViewerPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [activeResource, setActiveResource] = useState<ResourceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!courseId) {
            navigate('/dashboard');
            return;
        }
        setIsLoading(true);
        fetchCourseById(courseId)
            .then(data => {
                setCourse(data);
                if (data.modules?.[0]?.resources?.[0]) {
                    setActiveResource(data.modules[0].resources[0]);
                }
            })
            .catch(() => navigate('/dashboard'))
            .finally(() => setIsLoading(false));
    }, [courseId, navigate]);

    useEffect(() => {
        let objectUrl: string | null = null;
        const loadPdf = async () => {
            if (activeResource?.resourceType === 'PDF' && activeResource.id) {
                const token = getToken();
                if (!token) return;
                try {
                    const response = await fetch(`http://localhost:8080/api/resources/${activeResource.id}/view`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Failed to load PDF resource.');
                    const blob = await response.blob();
                    objectUrl = URL.createObjectURL(blob);
                    setPdfBlobUrl(objectUrl);
                } catch (error) {
                    console.error(error);
                    setPdfBlobUrl(null);
                }
            }
        };
        loadPdf();
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [activeResource]);

    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading Your Course...</div>;
    if (!course) return <div className="flex items-center justify-center h-screen text-red-500">Could not load course. You may not have access.</div>;

    const renderResourceContent = () => {
        if (!activeResource) return <div className="flex items-center justify-center h-full bg-slate-100 rounded-lg"><p>Select a resource to begin.</p></div>;
        switch (activeResource.resourceType) {
            case 'PDF':
                return pdfBlobUrl ? 
                    <iframe src={pdfBlobUrl} className="w-full h-full border-0" title={activeResource.title}></iframe> :
                    <div className="flex items-center justify-center h-full">Loading PDF...</div>;
            case 'VIDEO':
                const embedUrl = convertToEmbedUrl(activeResource.url || '');
                return <iframe src={embedUrl} className="w-full h-full border-0 bg-white" title={activeResource.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
            case 'LINK':
                return (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full bg-slate-50 rounded-lg">
                        <div className="p-4 bg-indigo-100 rounded-full">{getResourceIcon('LINK')}</div>
                        <h3 className="mt-4 text-xl font-bold text-slate-800">{activeResource.title}</h3>
                        <p className="mt-2 text-slate-600">This external resource cannot be displayed here due to security policies.</p>
                        <a href={activeResource.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700">
                            Open Link in New Tab
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                        </a>
                    </div>
                );
            default:
                return <div className="p-8">Unsupported resource type.</div>;
        }
    };
    
    const handleDownload = async (resource: ResourceData) => {
        const token = getToken();
        if (!token || !resource.id) return;
        try {
            const response = await fetch(`http://localhost:8080/api/resources/${resource.id}/download`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Download failed.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = resource.title || 'download.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            alert("Could not download the file.");
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <DashboardNavbar />
            <div className="flex-grow flex overflow-hidden">
                {/* Responsive Sidebar (Drawer) */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                )}
                <aside className={`fixed lg:static top-0 left-0 h-full w-80 bg-white border-r flex-shrink-0 overflow-y-auto z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                    <div className="p-4 sticky top-0 bg-white z-10 border-b flex justify-between items-center">
                        <h2 className="font-bold text-lg truncate">{course.title}</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-800">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <nav className="p-4">
                        {course.modules.map(module => (
                            <div key={module.id} className="mb-4">
                                <h3 className="font-semibold text-slate-800 px-2">{module.title}</h3>
                                <ul className="mt-2 space-y-1">
                                    {module.resources.length > 0 ? module.resources.map(resource => (
                                        <li key={resource.id}>
                                            <button 
                                                onClick={() => {
                                                    setActiveResource(resource);
                                                    setIsSidebarOpen(false);
                                                }}
                                                className={`w-full text-left flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${activeResource?.id === resource.id ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                {getResourceIcon(resource.resourceType)}
                                                <span>{resource.title}</span>
                                            </button>
                                        </li>
                                    )) : (
                                        !course.isEnrolled && (
                                            <li className="px-2 py-2 text-sm text-slate-400 italic flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"></path></svg>
                                                Enroll to unlock
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Viewer */}
                <main className="flex-grow flex flex-col bg-slate-200 relative">
                    {!course.isEnrolled && (
                        <div className="absolute top-0 left-0 right-0 bg-yellow-300 p-4 text-center z-20 shadow-lg flex items-center justify-center gap-4">
                            <p className="font-semibold text-yellow-800">This is a preview. Enroll now to get full access!</p>
                            <Link to={`/checkout/course/${course.id}`} className="px-4 py-1 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 whitespace-nowrap">
                                Enroll Now
                            </Link>
                        </div>
                    )}
                    <header className={`bg-white border-b p-4 flex items-center justify-between flex-shrink-0 ${!course.isEnrolled ? 'pt-16' : ''}`}>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 text-slate-600 hover:bg-slate-100 rounded-md">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </button>
                            <h1 className="text-xl font-semibold">{activeResource?.title || 'Select a resource'}</h1>
                        </div>
                        <div>
                            {activeResource?.resourceType === 'PDF' && (
                                <button onClick={() => handleDownload(activeResource)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    Download
                                </button>
                            )}
                            {(activeResource?.resourceType === 'LINK' || activeResource?.resourceType === 'VIDEO') && activeResource.url && (
                                <a href={activeResource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                                    Open in New Tab
                                </a>
                            )}
                        </div>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto">
                        {renderResourceContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CourseViewerPage;