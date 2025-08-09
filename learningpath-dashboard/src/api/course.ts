import { getToken } from "@/hooks/useAuth";

// --- TYPE DEFINITIONS ---

// --- NEW: Define the Page type from the Spring Boot backend ---
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // current page number (0-indexed)
    size: number;
}


export interface ResourceData {
  id?: number;
  title: string;
  resourceType: 'PDF' | 'VIDEO' | 'LINK';
  url?: string;
  estimatedTimeToCompleteMinutes?: number;
  filePath?: string | null;
}

export interface ModuleData {
  id?: number;
  title: string;
  resources: ResourceData[];
}

export interface CourseData {
  id?: number;
  title: string;
  description: string;
  price?: number | null;
  discountPercentage?: number | null;
  modules: ModuleData[];
}

export interface CourseSummary {
    id: number;
    title: string;
    description: string;
    thumbnailPath: string | null;
    price: number | null;
    discountPercentage: number | null;
    instructorName: string;
    createdAt: string;
    updatedAt: string;
    isEnrolled: boolean; 
     moduleCount: number; 
    enrollmentCount: number; 
}

export interface CourseDetail extends CourseData {
    thumbnailPath: string | null;
    createdAt: string;
    updatedAt: string;
    isEnrolled: boolean;
}

export interface EnrolledStudent {
    userId: number;
    fullName: string;
    email: string;
    enrollmentDate: string;
}

export interface EnrollmentStat {
    date: string;
    enrollmentCount: number;
}

export interface CourseAnalytics {
    courseId: number;
    courseTitle: string;
    totalEnrollments: number;
    coursePrice: number | null;
    courseDiscount: number | null;
    dailyEnrollments: EnrollmentStat[];
    students: EnrolledStudent[];
}

// --- API FUNCTIONS ---

export async function createCourse(
    courseData: CourseData,
    thumbnail: File | null,
    resourceFiles: File[]
) {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const formData = new FormData();
    formData.append("courseData", JSON.stringify(courseData));
    if (thumbnail) {
        formData.append("thumbnail", thumbnail);
    }
    resourceFiles.forEach(file => {
        formData.append("files", file);
    });

    const response = await fetch("http://localhost:8080/api/courses", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Your session has expired. Please log out and log in again.");
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Failed to create course. Server responded with status ${response.status}`);
    }
    return response.json();
}

export async function fetchCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const response = await fetch(`http://localhost:8080/api/courses/${courseId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch course analytics.");
    }
    return response.json();
}


export async function fetchMyCourses(page: number, size: number): Promise<Page<CourseSummary>> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const response = await fetch(`http://localhost:8080/api/courses/my-courses?page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Your session has expired. Please log out and log in again.");
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Failed to fetch your courses. Server responded with status ${response.status}`);
    }
    return response.json();
}



export async function fetchAllCourses(page: number, size: number): Promise<Page<CourseSummary>> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const response = await fetch(`http://localhost:8080/api/courses/all-for-student?page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const status = response.status;
        let errorMessage = `HTTP Error ${status}: Failed to fetch courses.`;
        try {
            const errorJson = await response.json();
            if (errorJson.message) {
                errorMessage = `Error ${status}: ${errorJson.message}`;
            }
        } catch (e) {
            console.error("The error response from the server was not in JSON format.");
        }
        if (status === 401 || status === 403) {
            errorMessage += "\nHint: This is an authorization error. Please ensure you are logged in as a user with the 'STUDENT' role.";
        }
        throw new Error(errorMessage);
    }
    return response.json();
}

export async function fetchCourseById(courseId: string): Promise<CourseDetail> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const response = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
        //  This option tells the browser to never use a cached version
        // of this request, guaranteeing that you always get the latest enrollment status.
        cache: 'no-store'
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Your session has expired. Please log out and log in again.");
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Failed to fetch course details. Server responded with status ${response.status}`);
    }
    return response.json();
}

export async function updateCourse(
    courseId: string,
    courseData: CourseData,
    thumbnail: File | null,
    resourceFiles: File[]
): Promise<{ message: string }> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const formData = new FormData();
    formData.append("courseData", JSON.stringify(courseData));

    if (thumbnail) {
        formData.append("thumbnail", thumbnail);
    }
    resourceFiles.forEach(file => {
        formData.append("files", file);
    });

    const response = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Your session has expired. Please log out and log in again.");
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Failed to update course. Server responded with status ${response.status}`);
    }
    return response.json();
}

export async function deleteCourse(courseId: number): Promise<{ message: string }> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const response = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Your session has expired. Please log out and log in again.");
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Failed to delete course. Server responded with status ${response.status}`);
    }
    return response.json();
}

export async function fetchMyEnrolledCourses(): Promise<CourseSummary[]> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const response = await fetch("http://localhost:8080/api/enrollments/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch enrolled courses.");
    }
    return response.json();
}

export async function enrollInCourse(courseId: number): Promise<{ message: string }> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const response = await fetch(`http://localhost:8080/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to enroll in course.");
    }
    return response.json();
}
export async function searchCourses(query: string, page: number, size: number): Promise<Page<CourseSummary>> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const response = await fetch(`http://localhost:8080/api/courses/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Your session has expired. Please log out and log in again.");
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Failed to search courses. Server responded with status ${response.status}`);
    }
    return response.json();
}