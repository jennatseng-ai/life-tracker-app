import { useState, useEffect } from 'react';
import './App.css';
import Weather from './components/Weather';
import Bus from './components/Bus';
import MRT from './components/MRT';
import HSR from './components/HSR';
import HabitTracker from './components/HabitTracker';

function App() {
  const [activeTab, setActiveTab] = useState('weather');

  return (
    <div className="app">
      <header className="header">
        <h1>📱 生活助手</h1>
        <p>天氣 • 公車 • 捷運 • 高鐵</p>
      </header>

      <nav className="tabs">
        {[
          { id: 'weather', label: '天氣' },
          { id: 'bus', label: '公車' },
          { id: 'mrt', label: '捷運' },
          { id: 'hsr', label: '高鐵' },
          { id: 'habit', label: '待辦' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="content">
        {activeTab === 'weather' && <Weather />}
        {activeTab === 'bus' && <Bus />}
        {activeTab === 'mrt' && <MRT />}
        {activeTab === 'hsr' && <HSR />}
        {activeTab === 'habit' && <HabitTracker />}
      </div>
    </div>
  );
}

export default App;
