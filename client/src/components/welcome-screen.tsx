import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const WelcomeScreen: React.FC = () => {
  const [_, setLocation] = useLocation();

  const handleRoleSelection = (role: "tourist" | "guide") => {
    localStorage.setItem("selectedRole", role);
    setLocation("/register");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md mb-4 overflow-hidden rounded-lg shadow-md">
        <img
          src="https://th.bing.com/th/id/R.cf65bdb1311a1030ec016c7805dfcd5b?rik=zOP3LKod9dM2zg&riu=http%3a%2f%2fwww.thehistoryhub.com%2fwp-content%2fuploads%2f2014%2f04%2fGateway-of-India.jpg&ehk=x4vW3SbOLxDDG0ctopOLuWlZH9vov454Gldg0EY14us%3d&risl=&pid=ImgRaw&r=0&"
          alt="Gateway of India"
          className="w-full h-auto"
        />
      </div>
      <h1 className="text-3xl font-bold font-sans text-center text-[#DC143C] mt-2">
        Maharashtra Tour Guide
      </h1>
      <p className="text-center text-gray-800 mb-8">
        Connect with local guides & explore Maharashtra
      </p>

      <h2 className="text-lg font-medium mb-4">Choose your role</h2>

      <div className="w-full max-w-xs space-y-3">
        <Button
          className="w-full py-6 bg-[#DC143C] hover:bg-[#B01030] text-white"
          onClick={() => handleRoleSelection("tourist")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 mr-2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          I am a Tourist
        </Button>
        <Button
          className="w-full py-6 bg-green-700 hover:bg-green-800 text-white"
          onClick={() => handleRoleSelection("guide")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 mr-2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <circle cx="12" cy="8" r="2" />
            <path d="M12 10v5" />
          </svg>
          I am a Guide
        </Button>
        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account?</span>
          <button
            onClick={() => setLocation("/login")}
            className="text-[#DC143C] font-medium ml-1 hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
