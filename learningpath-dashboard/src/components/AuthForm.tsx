import React, { useState, useEffect, useRef } from "react";
import api from "@/api/api";
import { useNavigate } from "react-router-dom";
import MessageModal from "@/components/MessageModal"; 

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type: initialType }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(initialType === "login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [modal, setModal] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ isVisible: false, message: "", type: "info" });

  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    
    if (initialType === "login" && !isLogin) {
      animateFormSwitch(true);
    } else if (initialType === "register" && isLogin) {
      animateFormSwitch(false);
    }
    
  }, [initialType]); 

  const animateFormSwitch = (targetIsLogin: boolean) => {
    if (formRef.current) {
      formRef.current.classList.add("animate-form-switch-out");
      setTimeout(() => {
        setIsLogin(targetIsLogin);
      if (targetIsLogin) {
          setForm((prev) => ({ ...prev, fullName: "", role: "STUDENT" }));
        } else {
        
        }
        formRef.current?.classList.remove("animate-form-switch-out");
        formRef.current?.classList.add("animate-form-switch-in");
      }, 300); 
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;

      const response = await api.post(endpoint, payload);

      if (isLogin) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        setModal({
          isVisible: true,
          message: "Login successful! Redirecting...",
          type: "success",
        });
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
      
        setModal({
          isVisible: true,
          message: "Registration successful! Please log in.",
          type: "success",
        });
        setTimeout(() => {
          setForm({ fullName: "", email: "", password: "", role: "STUDENT" }); // Clear form fields
          navigate("/login"); // Navigate to login page
           window.location.reload(); // Force reload to refresh the login form state
        }, 1000); // Changed from 1500 to 1000, aligning with previous mention
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorType: "success" | "error" | "info" = "error";

      if (error.response) {
        console.error("API Error Response:", error.response.data);
        console.error("API Error Status:", error.response.status);

        switch (error.response.status) {
          case 400: 
            if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.data.errors && error.response.data.errors.length > 0) {
              errorMessage = error.response.data.errors.map((err: any) => err.msg || err.message).join(", ");
            } else {
              errorMessage = "Invalid input. Please check your details.";
            }
            break;
          case 401: 
            if (isLogin) {
            errorMessage = "Invalid email or password. Please try again.";
          } else {
            
            errorMessage = "This email is already registered. Please sign in instead.";
          }
          break;
            
          case 403: // Forbidden
            errorMessage = error.response.data.message || "Access denied. You do not have permission for this action.";
            break;
          case 409:
            if (!isLogin && error.response.data.message && error.response.data.message.includes("email already registered")) {
                errorMessage = "This email is already registered. Please log in or use a different email.";
            } else {
                errorMessage = error.response.data.message || "A conflict occurred. Please try again.";
            }
            break;
          case 404: 
            errorMessage = "Service not found. Please try again later.";
            break;
          case 500: 
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            
            errorMessage = error.response.data.message || `An unknown server error occurred (Status: ${error.response.status}).`;
            break;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your internet connection.";
      } else {
        errorMessage = "Request failed. Please try again.";
      }

      setModal({
        isVisible: true,
        message: errorMessage,
        type: errorType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full w-full p-4 font-sans">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-3xl px-8 py-10 space-y-7 relative overflow-hidden transition-all duration-300 ease-in-out"
      >
        <h2 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight mb-6">
          {isLogin ? "Welcome Back" : "Create Your Account"}
        </h2>

        {!isLogin && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                required={!isLogin}
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                I am a
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-800 py-3 px-5 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-400 shadow-sm transition-all duration-200"
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye off icon

                  <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                ) : (
                  // Eye on icon
                  <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:ring-4 focus:ring-blue-300 focus:outline-none
            ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isLogin ? "Signing In..." : "Signing Up..."}
            </span>
          ) : (
            isLogin ? "Sign In" : "Sign Up"
          )}
        </button>

        <p className="text-base text-center text-gray-600 mt-4">
          {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => animateFormSwitch(!isLogin)}
            className="text-blue-600 font-bold hover:underline ml-1"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </form>

      <MessageModal
        isVisible={modal.isVisible}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isVisible: false })}
      />
    </div>
  );
}