import React, {useState} from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Input from './pages/Input'
import Dashbboard from './pages/Dashboard';

export default function App() {
  const [profileData, setProfileData] = useState(null);
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Input onProfileData={setProfileData}/>} />
        <Route path='/dashboard' element={<Dashbboard profileData={profileData}/>}/>
      </Routes>
    </Router>
  )
}

