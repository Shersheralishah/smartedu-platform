// File: src/api/user.ts
import { getToken } from "@/hooks/useAuth";
import type { CourseData } from "./course";
export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  headline: string;
  biography: string;
  language: string;
  profileImage?: File | string | null;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  x?: string;
  youtube?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  role?: string;
  headline?: string;
  biography?: string;
  language?: string;
  profileImage?: string;
  socialLinks?: { platform: string; url: string }[];
}

// ✅ Upload image via backend endpoint (Cloudinary)
async function uploadImageToServer(file: File, fullName: string): Promise<string> {
  const token = getToken();
  if (!token) throw new Error("No token found");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", fullName);

  const res = await fetch("http://localhost:8080/api/user/profile/upload-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Image upload failed");

  return result.url;
}




export async function fetchMyUser() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch("http://localhost:8080/api/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return await response.json(); // Returns { fullName, email, role }
}



export async function updateCourse(courseId: string, courseData: CourseData): Promise<{ message: string }> {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    // For simplicity, this  function does not handle file uploads.
    // A full implementation would require FormData similar to createCourse.
    const response = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update course.");
    }
    return response.json();
}

//  profile with deduplicated social links (1 per platform)
export async function updateUserProfile(data: any) {
  const token = localStorage.getItem("token");

  interface SocialLink {
    platform: string;
    url: string;
  }

  // ✅ Clean + deduplicate social links
  const cleanSocialLinks = Array.isArray(data.socialLinks)
    ? data.socialLinks
        .filter((link: SocialLink): link is SocialLink =>
          link &&
          typeof link.platform === "string" &&
          typeof link.url === "string" &&
          link.url.trim() !== ""
        )
        .reduce((acc: Record<string, SocialLink>, link: SocialLink) => {
          acc[link.platform.toLowerCase()] = link;
          return acc;
        }, {})
    : {};

  const dedupedLinks: SocialLink[] = Object.values(cleanSocialLinks);

  const payload = {
    ...data,
    socialLinks: dedupedLinks,
  };

  const res = await fetch("http://localhost:8080/api/user/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Failed to update profile: " + errorText);
  }

  return res.json();
}



// ✅ Fetch profile for Navbar, Profile, EditProfile, Dropdown
export async function fetchUserProfile(): Promise<UserProfile> {
  const token = getToken();
  if (!token) throw new Error("No token found");

  const response = await fetch("http://localhost:8080/api/user/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch profile: ${errorText}`);
  }

  return await response.json();
}
