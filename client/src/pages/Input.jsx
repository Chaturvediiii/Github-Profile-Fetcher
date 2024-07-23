import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaInfoCircle, FaCodeBranch, FaHourglassHalf, FaExclamationTriangle } from "react-icons/fa";

export default function Input({ onProfileData }) {
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const loadingMessages = [
    { text: "Parsing Username", icon: <FaUser className="text-4xl animate-spin" /> },
    { text: "Fetching Name", icon: <FaInfoCircle className="text-4xl animate-spin" /> },
    { text: "Fetching other details", icon: <FaInfoCircle className="text-4xl animate-spin" /> },
    { text: "Fetching Repositories", icon: <FaCodeBranch className="text-4xl animate-spin" /> },
    { text: "This may take a moment", icon: <FaHourglassHalf className="text-4xl animate-spin" /> },
    { text: "This is taking longer than expected", icon: <FaExclamationTriangle className="text-4xl animate-spin" /> },
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
    <div className="h-screen flex flex-col justify-center items-center mx-auto max-w-lg">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-white">
          {loadingMessage.icon}
          <p className="text-xl mt-3">{loadingMessage.text}</p>
        </div>
      ) : (
        <div className="bg-gray-800 p-3 w-full rounded-md">
          <div className="text-white flex flex-col gap-4">
            <h1>Enter Github Username</h1>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="Enter GitHub URL"
              className="p-3 bg-transparent border border-white rounded-md"
            />
            <button onClick={handleFetch} className="p-3 bg-gray-900 rounded-md">
              Fetch Profile
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

