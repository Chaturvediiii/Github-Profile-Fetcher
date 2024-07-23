import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GithubProfileFetcher({ profileData }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [storedProfileData, setStoredProfileData] = useState(null);
  const reposPerPage = 9;

  useEffect(() => {
    const savedProfileData = localStorage.getItem("profileData");
    if (savedProfileData) {
      setStoredProfileData(JSON.parse(savedProfileData));
    } else if (profileData) {
      setStoredProfileData(profileData);
      localStorage.setItem("profileData", JSON.stringify(profileData));
    }
  }, [profileData]);

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = storedProfileData?.repos?.slice(indexOfFirstRepo, indexOfLastRepo) || [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 md:p-8">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          View <span className="text-gray-500">{storedProfileData?.name ? `${storedProfileData.name}'s ` : ''}</span>
          GitHub Profile Details
        </h1>
        <button
          className="bg-gray-700 px-4 py-2 rounded mb-4"
          onClick={() => navigate('/')}
        >
          Back
        </button>
      </section>

      {storedProfileData && storedProfileData.name ? (
        <>
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 w-full max-w-5xl">
            <div className="flex-shrink-0">
              <img
                src={storedProfileData.avatar || "/user-placeholder.png"}
                alt="User"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{storedProfileData.name}</h2>
              <p className="text-gray-400 mb-1">Repositories: {storedProfileData.repos.length}</p>
              <p className="text-gray-400 mb-1">Followers: {storedProfileData.followers}</p>
              <p className="text-gray-400 mb-1">Following: {storedProfileData.following}</p>
              <p className="text-gray-400">Skills: {storedProfileData.skills?.join(", ") || "No skills listed"}</p>
            </div>
          </div>

          <div className="mt-8 w-full max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRepos.map((repo) => (
                <div key={repo.name} className="bg-gray-800 p-4 rounded">
                  <h3 className="text-xl font-bold mb-2">{repo.name}</h3>
                  <p className="text-gray-400 mb-2">{repo.description}</p>
                  <p className="text-gray-400">Tech Stack: {repo.language || "N/A"}</p>
                  <p className="text-gray-400">Stars: {repo.stargazers_count}</p>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 mt-2 inline-block">
                    View Repository
                  </a>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-700 px-4 py-2 rounded mr-2 disabled:bg-gray-500"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastRepo >= storedProfileData.repos.length}
                className="bg-gray-700 px-4 py-2 rounded disabled:bg-gray-500"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-400">No profile data available</p>
      )}
    </div>
  );
}

export default GithubProfileFetcher;
