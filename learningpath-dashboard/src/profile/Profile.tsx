// ✅ 1. Import both fetch functions
import { fetchUserProfile, fetchMyUser } from "@/api/user";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


interface ProfileData {
  fullName: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR'; // Role is now guaranteed to exist
  headline?: string;
  biography?: string;
  language?: string;
  profileImage?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const navigate = useNavigate();

  // ✅ 2. Replace the entire useEffect with this improved, async version
  useEffect(() => {
    const loadCompleteProfile = async () => {
      try {
        // Fetch core user data (with role) and extended profile data concurrently
        const [userData, profileData] = await Promise.all([
          fetchMyUser(),      // Fetches { fullName, email, role }
          fetchUserProfile()  // Fetches { headline, biography, socialLinks, etc. }
        ]);

        // Merge the two data sources into one complete profile object
        // userData is placed second to ensure its values (like role) are definitive
        const combinedProfile: ProfileData = {
          ...profileData,
          ...userData,
        };

        setProfile(combinedProfile);

      } catch (err) {
        console.error("Failed to load complete user profile:", err);
        // navigate("/login");
      }
    };

    loadCompleteProfile();
  }, []);

  // ... rest of the component remains the same
  // The rendering logic for the border will now work correctly
  // because `profile.role` will have the accurate value.
  if (!profile)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-medium text-gray-700">Loading profile...</div>
      </div>
    );

  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.fullName || "User"
  )}&background=1E40AF&color=FFFFFF&bold=true&size=128`;
  
  // ... rest of your component filebackground=1E40AF&color=FFFFFF&bold=true&size=128`;

  // Social platforms data remains the same
  const socialPlatforms = [
    { name: "Website", icon: (
        <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
    )},
    { name: "Facebook", icon: (
        <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22H12c5.523 0 10-4.477 10-10z" clipRule="evenodd" /></svg>
    )},
    { name: "Instagram", icon: (
        <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.715.056 8.825.356 10.018 1.436 10.372 10.372.043.93.056 1.286.056 3.715 0 2.43-.013 2.784-.056 3.715-.356 8.825-1.436 10.018-10.372 10.372-.93.043-1.286.056-3.715.056-2.43 0-2.784-.013-3.715-.056C2.51 21.905 1.436 20.712 1.08 11.88c-.043-.93-.056-1.286-.056-3.715 0-2.43.013-2.784.056-3.715C1.436 2.51 2.629 1.436 11.45.08c.93-.043 1.286-.056 3.715-.056zM12 17.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM12 14.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM17.25 6.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" /></svg>
    )},
    { name: "LinkedIn", icon: (
        <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.529-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
    )},
    { name: "TikTok", icon: (
        <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525 2.115A8.966 8.966 0 0115 11.5a8.967 8.967 0 01-3.475 7.385V12.5h-3.475V11.5h3.475V5.115a.5.5 0 00-.5-.5H9.5V2.115h3.025zM12 22a10 10 0 100-20 10 10 0 000 20z"/></svg>
    )},
    { name: "X", icon: (
        <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.13l-6.25-8.048-5.713 8.048H2.25L10.775 9.17 2.25 2.25h3.308l5.25 6.82L18.244 2.25zm-1.5 15.439h2.2L8.75 4.306H6.55l10.194 13.383z"/></svg>
    )},
    { name: "YouTube", icon: (
        <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.058C20.355 5.132 20.708 5.51 20.864 6.052A3.582 3.582 0 0121 12c0 1.956-.347 3.582-.864 3.948-.156.543-.509.921-1.052.995C18.736 17 12 17 12 17s-6.736 0-7.812-.132c-.543-.074-.896-.452-1.052-.995A3.582 3.582 0 013 12c0-1.956.347-3.582.864-3.948.156-.543.509-.921 1.052-.995C5.264 7 12 7 12 7s6.736 0 7.812-.132zM10.5 15.5V8.5L16 12l-5.5 3.5z" clipRule="evenodd" /></svg>
    )},
  ];

  const userSocialLinks = profile.socialLinks?.filter(link =>
    socialPlatforms.some(platform => platform.name === link.platform)
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <div className="p-4">
        <DashboardNavbar />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <div className="bg-white shadow-xl rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 border border-gray-100">
          {/* ✅ 2. Conditional border color added here */}
          <img
            src={profile.profileImage || defaultAvatarUrl}
            alt={`${profile.fullName}'s Profile`}
            className={`w-36 h-36 rounded-full object-cover border-4 shadow-md transform transition-transform duration-300 hover:scale-105 ${
              profile.role === 'STUDENT' ? 'border-green-500' : 'border-red-500'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultAvatarUrl; // Fallback on error
            }}
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {profile.fullName}
            </h1>
            <p className="text-lg text-gray-600">{profile.email}</p>
            {profile.headline && (
              <p className="text-xl font-medium text-gray-700 mt-2 italic">
                {profile.headline}
              </p>
            )}
            {profile.language && (
              <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 mt-2">
                <svg
                  className="w-4 h-4 mr-1 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  ></path>
                </svg>
                <span>Speaks: {profile.language}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/profile/edit")}
            className="mt-6 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Edit Profile
            </span>
          </button>
        </div>

        {/* Biography Section */}
        {profile.biography && (
          <div className="mt-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About Me</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profile.biography}
            </p>
          </div>
        )}

        {/* Social Links Section */}
        {userSocialLinks.length > 0 && (
          <div className="mt-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect with Me</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSocialLinks.map((link) => {
                const platformInfo = socialPlatforms.find(p => p.name === link.platform);
                if (!platformInfo) return null;

                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 shadow-sm group"
                  >
                    <div className="flex-shrink-0">
                      {platformInfo.icon}
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors duration-200">
                      {link.platform}
                    </span>
                    <svg className="ml-auto w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
