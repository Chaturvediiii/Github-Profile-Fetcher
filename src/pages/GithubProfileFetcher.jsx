import React, { useState, useEffect } from "react";

export default function GithubProfileFetcher({ profileData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [storedProfileData, setStoredProfileData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRepos, setFilteredRepos] = useState([]);
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

  useEffect(() => {
    if (storedProfileData) {
      filterRepos(searchTerm);
    }
    console.log(storedProfileData)
  }, [searchTerm, storedProfileData]);

  const filterRepos = (keyword) => {
    const filtered = storedProfileData.repos.filter((repo) =>
      repo.language?.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredRepos(filtered);
    setCurrentPage(1);
  };

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = filteredRepos.slice(indexOfFirstRepo, indexOfLastRepo);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 md:p-8">
      {storedProfileData ? (
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
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {storedProfileData.name === null
                  ? "Name not available"
                  : storedProfileData.name}
              </h2>
              <p className="text-gray-400 mb-1">
                Repositories: {storedProfileData.repos.length}
              </p>
              <p className="text-gray-400 mb-1">
                Followers: {storedProfileData.followers}
              </p>
              <p className="text-gray-400 mb-1">
                Following: {storedProfileData.following}
              </p>
              <p className="text-gray-400">
                Skills:{" "}
                {storedProfileData.skills?.join(", ") || "No skills listed"}
              </p>
            </div>
          </div>

          <div className="mt-8 w-full max-w-5xl">
            <div className="mb-4 flex flex-col">
              <input
                type="text"
                placeholder="Search by tech stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 p-2 rounded text-white mb-2 w-full max-w-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRepos.length > 0 ? (
                currentRepos.map((repo) => (
                  <div key={repo.name} className="bg-gray-800 p-4 rounded">
                    <h3 className="text-xl font-bold mb-2">{repo.name}</h3>
                    <p className="text-gray-400">
                      Language : {repo.language || "N/A"}
                    </p>
                    <p className="text-gray-400">
                      Stars: {repo.stargazers_count}
                    </p>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 mt-2 inline-block"
                    >
                      View Repository
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">
                  No repositories found matching the tech stack.
                </p>
              )}
            </div>

            {filteredRepos.length > reposPerPage && (
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
                  disabled={indexOfLastRepo >= filteredRepos.length}
                  className="bg-gray-700 px-4 py-2 rounded disabled:bg-gray-500"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-400">No profile data available</p>
      )}
    </div>
  );
}
