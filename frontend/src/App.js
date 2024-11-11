import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CampaignForm from './components/CampaignForm';
import CampaignDetail from './components/CampaignDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CampaignForm />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
