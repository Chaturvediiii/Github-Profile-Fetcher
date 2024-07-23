import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaInfoCircle,
  FaCodeBranch,
  FaHourglassHalf,
  FaExclamationTriangle,
} from "react-icons/fa";

// Example image URL; replace with your preferred image
const illustrationImage =
  "assets/bg.png";

export default function Input({ onProfileData }) {
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const loadingMessages = [
    {
      text: "Parsing Username",
      icon: <FaUser className="text-4xl text-blue-400 animate-spin" />,
    },
    {
      text: "Fetching Name",
      icon: <FaInfoCircle className="text-4xl text-green-400 animate-spin" />,
    },
    {
      text: "Fetching other details",
      icon: <FaInfoCircle className="text-4xl text-yellow-400 animate-spin" />,
    },
    {
      text: "Fetching Repositories",
      icon: <FaCodeBranch className="text-4xl text-purple-400 animate-spin" />,
    },
    {
      text: "This may take a moment",
      icon: (
        <FaHourglassHalf className="text-4xl text-orange-400 animate-spin" />
      ),
    },
    {
      text: "This is taking longer than expected",
      icon: (
        <FaExclamationTriangle className="text-4xl text-red-400 animate-spin" />
      ),
    },
  ];

  const handleFetch = async () => {
    setError(null);
    const username = githubUrl.split("/").pop();
    setIsLoading(true);

    let messageIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(loadingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 2000);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/github/${username}`
      );
      clearInterval(interval);
      setIsLoading(false);
      onProfileData(response.data);
      navigate("/dashboard");
    } catch (error) {
      clearInterval(interval);
      console.error("Error fetching GitHub data:", error);
      setError(
        error.response
          ? error.response.data.message
          : "Error fetching GitHub data"
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem("profileData");
    setGithubUrl("");
  }, []);

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Illustration Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-900">
        <img
          src="src/assets/bg.png"
          alt="Illustration"
          className="w-84 h-auto object-cover "
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-gray-900 p-4 md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-white bg-gray-800 p-6 rounded-lg shadow-lg">
            {loadingMessage.icon}
            <p className="text-xl mt-3">{loadingMessage.text}</p>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-md shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">
              Enter GitHub Username
            </h1>
            <p className="text-gray-400 mb-4">
              To fetch a GitHub profile, please enter the username in the
              format: <strong>https://github.com/username</strong>. We will
              retrieve the profile details and display them for you.
            </p>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="e.g. https://github.com/username"
              className="p-3 bg-gray-700 border border-gray-600 rounded-md text-white w-full mb-4"
            />
            <button
              onClick={handleFetch}
              className="bg-gray-900 text-white p-3 rounded-md w-full hover:bg-gray-700 transition duration-300"
            >
              Fetch Profile
            </button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
