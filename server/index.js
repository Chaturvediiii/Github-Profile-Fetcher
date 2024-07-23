import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://localhost:5173', // Allow only this origin to access the API
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractSkillsFromReadme = (readmeContent) => {
  const skills = [];
  const skillKeywords = ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C++', 'C#', 'PHP', 'Laravel', 'Ruby', 'Rails', 'HTML', 'CSS', 'SQL', 'TypeScript', 'GraphQL'];

  skillKeywords.forEach((skill) => {
    const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');
    if (regex.test(readmeContent)) {
      skills.push(skill);
    }
  });

  return skills;
};

app.get('/api/github/:username', async (req, res) => {
  const { username } = req.params;
  const githubApiUrl = `https://api.github.com/users/${username}`;

  try {
    const userResponse = await axios.get(githubApiUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'request',
      },
    });

    const reposUrl = userResponse.data.repos_url;
    const reposResponse = await axios.get(reposUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'request',
      },
      params: {
        per_page: 100, // GitHub API allows a maximum of 100 results per page
      },
    });

    const starredReposUrl = `https://api.github.com/users/${username}/starred`;
    const starredReposResponse = await axios.get(starredReposUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'request',
      },
      params: {
        per_page: 100, // GitHub API allows a maximum of 100 results per page
      },
    });

    // Combine and deduplicate repositories
    const combinedRepos = [...reposResponse.data, ...starredReposResponse.data];
    const uniqueRepos = Array.from(new Map(combinedRepos.map(repo => [repo.id, repo])).values());

    let allSkills = [];

    for (const repo of uniqueRepos) {
      const readmeUrl = `https://api.github.com/repos/${username}/${repo.name}/readme`;
      try {
        const readmeResponse = await axios.get(readmeUrl, {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'request',
            Accept: 'application/vnd.github.VERSION.raw',
          },
        });
        const readmeContent = readmeResponse.data;
        const repoSkills = extractSkillsFromReadme(readmeContent);
        allSkills = [...new Set([...allSkills, ...repoSkills])]; // Combine and deduplicate skills
      } catch (error) {
        // Handle error (e.g., README not found)
      }
    }

    const userData = {
      name: userResponse.data.name,
      repos: uniqueRepos.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        url: repo.html_url,
        stargazers_count: repo.stargazers_count,
      })).sort((a, b) => b.stargazers_count - a.stargazers_count), // Sort by stars
      skills: allSkills,
      avatar: userResponse.data.avatar_url,
      location: userResponse.data.location,
      followers: userResponse.data.followers,
      following: userResponse.data.following,
      // Add other necessary fields
    };
    console.log(userResponse.data);
    res.json(userData);
  } catch (error) {
    console.error('Error fetching GitHub data:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: error.response ? error.response.data.message : 'Error fetching GitHub data',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


