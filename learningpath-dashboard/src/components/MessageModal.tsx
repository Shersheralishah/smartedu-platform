import React, { useEffect, useRef } from "react";

interface MessageModalProps {
  isVisible: boolean;
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number; // Optional: how long the message stays visible (in ms)
}

const MessageModal: React.FC<MessageModalProps> = ({
  isVisible,
  message,
  type,
  onClose,
  duration = 3000, // Default to 3 seconds
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically hide the message after `duration`
  useEffect(() => {
    if (isVisible) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }

    // Cleanup: Clear timeout if component unmounts or becomes invisible
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, duration, onClose]); 

  if (!isVisible) return null;

  let bgColorClass = "";
  let borderColorClass = "";
  let textColorClass = "";
  let icon = null;

  switch (type) {
    case "success":
      bgColorClass = "bg-green-100";
      borderColorClass = "border-green-500";
      textColorClass = "text-green-800";
      icon = (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      );
      break;
    case "error":
      bgColorClass = "bg-red-100";
      borderColorClass = "border-red-500";
      textColorClass = "text-red-800";
      icon = (
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      );
      break;
    case "info":
    default:
      bgColorClass = "bg-blue-100";
      borderColorClass = "border-blue-500";
      textColorClass = "text-blue-800";
      icon = (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      );
      break;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[999] p-4 rounded-xl shadow-lg border-l-4 ${bgColorClass} ${borderColorClass} ${textColorClass}
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
      onClick={onClose}
      role="alert"
    >
      <div className="flex items-center gap-3">
        {icon}
        <p className="font-medium">{message}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-gray-300 w-full rounded-b-lg overflow-hidden">
        <div
        
          className="h-full bg-current origin-left animate-progress"
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      </div>
    </div>
  );
};

export default MessageModal;