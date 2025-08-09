import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCourseAnalytics } from '@/api/course';
import type { CourseAnalytics, EnrolledStudent } from '@/api/course';
import DashboardNavbar from "@/components/DashboardNavbar";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// --- Professional Stat Card Component ---
interface StatCardProps {
    title: string;
    value: string; // Accept string for currency formatting
    icon: React.ReactNode;
    color: string;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border-l-4" style={{ borderColor: color }}>
        <div className="p-4 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

// --- Main Analytics Page ---
const CourseAnalyticsPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [studentSearch, setStudentSearch] = useState('');

    useEffect(() => {
        if (!courseId) {
            navigate('/dashboard');
            return;
        }
        setIsLoading(true);
        fetchCourseAnalytics(courseId)
            .then(setAnalytics)
            .catch(() => navigate('/dashboard'))
            .finally(() => setIsLoading(false));
    }, [courseId, navigate]);

    // --- Memoized Data Processing for Charts & Tables ---
    const { chartData, totalRevenue, avgEnrollments, filteredStudents } = useMemo(() => {
        if (!analytics) return { chartData: [], totalRevenue: 0, avgEnrollments: '0.0', filteredStudents: [] };

        const dailyEnrollments = analytics.dailyEnrollments.map(stat => ({
            date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            Enrollments: stat.enrollmentCount
        }));

        const revenue = (analytics.coursePrice || 0) * analytics.totalEnrollments * (1 - (analytics.courseDiscount || 0) / 100);
        
        const avg = analytics.dailyEnrollments.length > 0
            ? (analytics.totalEnrollments / analytics.dailyEnrollments.length).toFixed(1)
            : '0.0';

        const students = analytics.students.filter(student => 
            student.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
            student.email.toLowerCase().includes(studentSearch.toLowerCase())
        );

        return { chartData: dailyEnrollments, totalRevenue: revenue, avgEnrollments: avg, filteredStudents: students };
    }, [analytics, studentSearch]);


    if (isLoading) return <div className="text-center p-10">Loading Analytics...</div>;
    if (!analytics) return <div className="text-center p-10">Could not load analytics for this course.</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardNavbar searchQuery="" onSearchChange={() => {}} />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <p className="text-sm font-semibold text-indigo-600">Analytics Dashboard</p>
                        <h1 className="text-3xl font-bold text-slate-900">{analytics.courseTitle}</h1>
                    </div>
                    <Link to="/dashboard" className="mt-4 sm:mt-0 text-sm font-semibold text-indigo-600 hover:underline">
                        &larr; Back to My Courses
                    </Link>
                </div>

                {/* Stat Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        title="Total Enrollments" 
                        value={analytics.totalEnrollments.toString()} 
                        color="#4f46e5"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 013.42-2.143M12 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"></path></svg>}
                    />
                    <StatCard 
                        title="Estimated Revenue" 
                        value={`₹${totalRevenue.toFixed(2)}`} 
                        color="#16a34a"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01V8m0 0h.01M12 14h.01M12 16v-1m0-1v-.01M12 18v-1m0-1v-.01"></path></svg>}
                    />
                     <StatCard 
                        title="Avg. Daily Enrollments" 
                        value={avgEnrollments} 
                        color="#ea580c"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                    />
                </div>

                {/* Enrollment Graph */}
                <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-800">Enrollments Over Time</h3>
                    <div className="w-full h-80 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }} />
                                <Legend />
                                <Area type="monotone" dataKey="Enrollments" stroke="#4f46e5" fillOpacity={1} fill="url(#colorEnrollments)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Student Table */}
                <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <h3 className="text-xl font-semibold text-slate-800">Enrolled Students</h3>
                        <input 
                            type="text"
                            placeholder="Search students..."
                            value={studentSearch}
                            onChange={e => setStudentSearch(e.target.value)}
                            className="mt-4 sm:mt-0 w-full sm:w-64 px-4 py-2 border border-slate-300 rounded-lg"
                        />
                    </div>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Student Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Enrollment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.userId} className="bg-white border-b hover:bg-slate-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{student.fullName}</th>
                                        <td className="px-6 py-4">{student.email}</td>
                                        <td className="px-6 py-4">{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredStudents.length === 0 && <p className="text-center text-slate-500 py-8">No students found matching your search.</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseAnalyticsPage;
