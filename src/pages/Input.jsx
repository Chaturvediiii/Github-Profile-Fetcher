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
import bgImage from '/src/assets/bg.png'

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

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

  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const extractSkillsFromReadme = (readmeContent) => {
    const skills = [];
    const skillKeywords = [
     'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C++', 'C#', 'PHP', 'Laravel', 'Ruby', 'Rails', 'HTML', 'CSS', 'SQL', 'TypeScript', 'GraphQL', 'Go', 'Scala', 'Swift', 'Kotlin', 'Rust', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'Redux', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'SASS', 'LESS', 'PostgreSQL', 'MySQL', 'SQLite', 'MariaDB', 'Firebase', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Linux', 'Unix', 'Shell Scripting', 'PowerShell', 'Elixir', 'Phoenix', 'Haskell', 'Erlang', 'R', 'Matlab', 'TensorFlow', 'PyTorch', 'Keras', 'Pandas', 'NumPy', 'Scikit-Learn', 'Tableau', 'Power BI', 'Snowflake', 'Apache Kafka', 'Apache Spark', 'Hadoop', 'Airflow', 'RabbitMQ', 'Redis', 'Elasticsearch', 'Solr', 'Salesforce', 'SAP', 'Oracle', 'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Blender', 'Unity', 'Unreal Engine', 'Web3', 'Blockchain', 'Solidity', 'Hardhat', 'Truffle', 'Polkadot', 'Ethereum', 'Smart Contracts', 'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Objective-C', '3D Modeling', 'Augmented Reality (AR)', 'Virtual Reality (VR)', 'Machine Learning', 'Deep Learning', 'Natural Language Processing (NLP)', 'Computer Vision', 'Data Science', 'Data Analysis', 'Business Intelligence', 'Big Data', 'Cybersecurity', 'Penetration Testing', 'Ethical Hacking', 'Network Security', 'Cryptography', 'DevOps', 'CI/CD', 'Agile', 'Scrum', 'Kanban'

    ];

    skillKeywords.forEach((skill) => {
      const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');
      if (regex.test(readmeContent)) {
        skills.push(skill);
      }
    });

    return skills;
  };

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
      const githubApiUrl = `https://api.github.com/users/${username}`;
  
      // Fetch user data
      const userResponse = await axios.get(githubApiUrl, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      });
  
      const userData = userResponse.data;
      if(userData.login!==username){
        clearInterval(interval);
      setError(
        error.response ? error.response.data.message : "Error fetching GitHub data"
      );
      setIsLoading(false);
      }
      const reposUrl = userData.repos_url;
      const reposResponse = await axios.get(reposUrl, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        params: { per_page: 100 },
      });

  
      // Filter strictly for user-owned repositories (not organizations or forks)
      const repos = reposResponse.data.filter(
        (repo) => repo.owner.login === username && repo.owner.type === "User" && !repo.fork
      );
  
      const readmePromises = repos.map((repo) => {
        const readmeUrl = `https://api.github.com/repos/${username}/${repo.name}/readme`;
        return axios
          .get(readmeUrl, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.VERSION.raw",
            },
          })
          .then((response) => {
            const readmeContent = response.data;
  
            // Process README to find skills in specific sections
            return extractSkillsFromReadme(readmeContent);
          })
          .catch(() => {
            // If README not available, ignore this repo
            return [];
          });
      });
  
      // Combine and deduplicate extracted skills
      const allSkills = (await Promise.all(readmePromises)).flat();
      const uniqueSkills = [...new Set(allSkills)];
  
      // Prepare profile data to display
      const profileData = {
        name: userData.name,
        repos: repos.map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          url: repo.html_url,
          stargazers_count: repo.stargazers_count,
        })).sort((a, b) => b.stargazers_count - a.stargazers_count),
        skills: uniqueSkills,
        avatar: userData.avatar_url,
        location: userData.location,
        followers: userData.followers,
        following: userData.following,
      };
  
      clearInterval(interval);
      setIsLoading(false);
      onProfileData(profileData);
      navigate("/dashboard");
    } catch (error) {
      clearInterval(interval);
      setError(
        error.response ? error.response.data.message : "Error fetching GitHub data"
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
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-900">
        <img
          src={bgImage}
          alt="Illustration"
          className="w-84 h-auto object-cover "
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-gray-900 p-4 md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-white bg-gray-800 p-6 rounded-lg shadow-lg">
            {loadingMessage.icon}
            <p className="text-xl mt-3">{loadingMessage.text}</p>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-md shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Enter GitHub Username</h1>
            <p className="text-gray-400 mb-4">
              To fetch a GitHub profile, please enter the username in the format: <strong>username</strong>. We will
              retrieve the profile details and display them for you.
            </p>
            <p className="text-red-600">Note : Username is case-sensitive</p>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="e.g. username"
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
