import React, {useState} from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import GithubProfileFetcher from './pages/GithubProfileFetcher'
import Input from './pages/Input'

export default function App() {
  const [profileData, setProfileData] = useState(null);
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Input onProfileData={setProfileData}/>} />
        <Route path='/dashboard' element={<GithubProfileFetcher profileData={profileData}/>}/>
      </Routes>
    </Router>
  )
}

