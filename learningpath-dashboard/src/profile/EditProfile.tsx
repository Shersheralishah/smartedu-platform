import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile } from "@/api/user";
import { callGeminiAPI } from "@/api/gemini"; // ✅ Import the new service
import DashboardNavbar from "@/components/DashboardNavbar";
import MessageModal from "@/components/MessageModal";

export default function EditProfile() {
  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    biography: "",
    language: "",
    profileImage: "",
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    tiktok: "",
    x: "",
    youtube: "",
  });

  const [initialData, setInitialData] = useState<typeof form | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modal, setModal] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ isVisible: false, message: "", type: "info" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile()
      .then((data) => {
        const profile = {
          fullName: data.fullName || "",
          headline: data.headline || "",
          biography: data.biography || "",
          language: data.language || "",
          profileImage: data.profileImage || "",
          website: data.socialLinks?.find((l) => l.platform === "Website")?.url || "",
          facebook: data.socialLinks?.find((l) => l.platform === "Facebook")?.url || "",
          instagram: data.socialLinks?.find((l) => l.platform === "Instagram")?.url || "",
          linkedin: data.socialLinks?.find((l) => l.platform === "LinkedIn")?.url || "",
          tiktok: data.socialLinks?.find((l) => l.platform === "TikTok")?.url || "",
          x: data.socialLinks?.find((l) => l.platform === "X")?.url || "",
          youtube: data.socialLinks?.find((l) => l.platform === "YouTube")?.url || "",
        };
        setForm(profile);
        setInitialData(profile);
        setPreviewImage(profile.profileImage);
      })
      .catch((err) => {
        console.error("Failed to fetch user profile:", err.message);
        setModal({ isVisible: true, message: "Failed to load profile data. Please try again.", type: "error" });
      });
  }, []);

  useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setPreviewImage(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (!form.profileImage && !selectedImage) {
      setPreviewImage(null);
    }
  }, [selectedImage, form.profileImage]);

  // ✅ This function is now much cleaner and uses the imported service
  const handleSuggestBio = async () => {
    setIsGenerating(true);
    const prompt = `Based on the following user profile information, suggest a professional and engaging biography in the first person.
- Full Name: ${form.fullName || 'The user'}
- Headline: ${form.headline || 'Not provided'}
- Preferred Language: ${form.language || 'English'}
- Existing Bio Notes: "${form.biography || 'Not provided'}"

Please write a detailed biography (under 500 characters) in ${form.language || 'English'}. Return only the suggested biography text.`;
    
    try {
      const suggestedBio = await callGeminiAPI(prompt);
      if (suggestedBio) {
        setForm(prevForm => ({ ...prevForm, biography: suggestedBio }));
      }
    } catch (error: any) {
      setModal({
        isVisible: true,
        message: error.message || "An error occurred while generating content.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!initialData) {
      setModal({ isVisible: true, message: "Profile data not loaded. Please refresh and try again.", type: "error" });
      setIsSaving(false);
      return;
    }

    const hasFormChanges = JSON.stringify({ ...form, profileImage: null }) !== JSON.stringify({ ...initialData, profileImage: null });
    const hasImageChanges = !!selectedImage;
    const hasImageBeenRemoved = initialData.profileImage && !form.profileImage;

    if (!hasFormChanges && !hasImageChanges && !hasImageBeenRemoved) {
      setModal({ isVisible: true, message: "No changes made to the profile.", type: "info" });
      setIsSaving(false);
      return;
    }

    let imageUrl = form.profileImage;

    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("name", form.fullName || "profile-image");

        const res = await fetch("http://localhost:8080/api/user/profile/upload-image", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          body: formData,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Unknown image upload error");
        }

        const result = await res.json();
        imageUrl = result.url;
      } catch (err: any) {
        console.error("Image upload failed:", err);
        setModal({ isVisible: true, message: `Image upload failed: ${err.message || "Please try again."}`, type: "error" });
        setIsSaving(false);
        return;
      }
    }

    try {
      const { fullName, ...restOfForm } = form;
      await updateUserProfile({
        ...restOfForm,
        profileImage: imageUrl,
        firstName: fullName.split(" ")[0] || "",
        lastName: fullName.split(" ").slice(1).join(" ") || "",
        socialLinks: [
          { platform: "Website", url: form.website }, { platform: "Facebook", url: form.facebook },
          { platform: "Instagram", url: form.instagram }, { platform: "LinkedIn", url: form.linkedin },
          { platform: "TikTok", url: form.tiktok }, { platform: "X", url: form.x },
          { platform: "YouTube", url: form.youtube },
        ].filter(link => link.url && link.url.trim() !== ''),
      });
      setModal({ isVisible: true, message: "Profile updated successfully!", type: "success" });
      setInitialData({ ...form, profileImage: imageUrl });
      setSelectedImage(null);
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setModal({ isVisible: true, message: `Failed to update profile: ${err.message || "Please try again."}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
    } else {
      setSelectedImage(null);
      setPreviewImage(form.profileImage);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setForm(prevForm => ({ ...prevForm, profileImage: "" }));
  };

  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.fullName || "User")}&background=1E40AF&color=FFFFFF&bold=true`;

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <div className="p-4">
        <DashboardNavbar />
      </div>
      <div className="max-w-4xl mx-auto px-8 py-10 bg-white shadow-2xl rounded-3xl mt-8 mb-12 border border-gray-100">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Edit Your Public Profile</h2>
        <p className="text-lg text-gray-600 mb-8">Customize how others see you and connect with you.</p>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg group">
              <img src={previewImage || defaultAvatarUrl} alt="Profile Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatarUrl; }} />
              <button type="button" onClick={triggerFileInput} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full cursor-pointer" aria-label="Change profile picture">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.828-1.242a2 2 0 011.664-.89h.93a2 2 0 012 2v.93a2 2 0 00.89 1.664l1.242.828a2 2 0 01.89 1.664V17a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            <div className="flex items-center gap-4 mt-2">
              <button type="button" onClick={triggerFileInput} className="px-5 py-2 bg-blue-50 text-blue-700 font-semibold rounded-full hover:bg-blue-100 transition-colors duration-200 text-sm shadow-sm">Change Photo</button>
              {previewImage && <button type="button" onClick={handleRemoveImage} className="px-5 py-2 bg-red-50 text-red-700 font-semibold rounded-full hover:bg-red-100 transition-colors duration-200 text-sm shadow-sm">Remove</button>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input id="fullName" type="text" name="fullName" placeholder="Your Full Name" value={form.fullName} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800" />
            </div>
            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
              <input id="headline" type="text" name="headline" placeholder="e.g. UI/UX Designer at Acme Corp" value={form.headline} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800" />
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input id="language" type="text" name="language" placeholder="e.g. English, Spanish" value={form.language} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800" />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <textarea id="biography" name="biography" placeholder="Tell something about yourself... or click Suggest for an AI-powered draft." value={form.biography} onChange={handleChange} rows={5} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800 resize-y" />
            <button type="button" onClick={handleSuggestBio} disabled={isGenerating} className="absolute top-8 right-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait text-xs font-bold py-1 px-2 rounded-full transition-colors">{isGenerating ? '...' : '✨ Suggest'}</button>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "website", label: "Website", icon: ( <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg> )},
                { name: "facebook", label: "Facebook", icon: ( <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22H12c5.523 0 10-4.477 10-10z" clipRule="evenodd" /></svg> )},
                { name: "instagram", label: "Instagram", icon: ( <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.715.056 8.825.356 10.018 1.436 10.372 10.372.043.93.056 1.286.056 3.715 0 2.43-.013 2.784-.056 3.715-.356 8.825-1.436 10.018-10.372 10.372-.93.043-1.286.056-3.715.056-2.43 0-2.784-.013-3.715-.056C2.51 21.905 1.436 20.712 1.08 11.88c-.043-.93-.056-1.286-.056-3.715 0-2.43.013-2.784.056-3.715C1.436 2.51 2.629 1.436 11.45.08c.93-.043 1.286.056 3.715-.056zM12 17.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM12 14.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM17.25 6.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" /></svg> )},
                { name: "linkedin", label: "LinkedIn", icon: ( <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.529-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> )},
                { name: "tiktok", label: "TikTok", icon: ( <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525 2.115A8.966 8.966 0 0115 11.5a8.967 8.967 0 01-3.475 7.385V12.5h-3.475V11.5h3.475V5.115a.5.5 0 00-.5-.5H9.5V2.115h3.025zM12 22a10 10 0 100-20 10 10 0 000 20z"/></svg> )},
                { name: "x", label: "X (Twitter)", icon: ( <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.13l-6.25-8.048-5.713 8.048H2.25L10.775 9.17 2.25 2.25h3.308l5.25 6.82L18.244 2.25zm-1.5 15.439h2.2L8.75 4.306H6.55l10.194 13.383z"/></svg> )},
                { name: "youtube", label: "YouTube", icon: ( <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.058C20.355 5.132 20.708 5.51 20.864 6.052A3.582 3.582 0 0121 12c0 1.956-.347 3.582-.864 3.948-.156.543-.509.921-1.052.995C18.736 17 12 17 12 17s-6.736 0-7.812-.132c-.543-.074-.896-.452-1.052-.995A3.582 3.582 0 013 12c0-1.956.347-3.582.864-3.948.156-.543.509-.921-1.052-.995C5.264 7 12 7 12 7s6.736 0 7.812-.132zM10.5 15.5V8.5L16 12l-5.5 3.5z" clipRule="evenodd" /></svg> )},
              ].map((platform) => (
                <div key={platform.name} className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{platform.icon}</div>
                  <input type="text" name={platform.name} placeholder={`${platform.label} URL`} value={(form as any)[platform.name]} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-6">
            <button type="submit" disabled={isSaving || isGenerating} className={`bg-blue-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 ${(isSaving || isGenerating) ? "opacity-60 cursor-not-allowed" : ""}`}>
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <MessageModal isVisible={modal.isVisible} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isVisible: false })} />
    </div>
  );
}
