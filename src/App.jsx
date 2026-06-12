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
        <h1>🌤️ Jenna's Daily</h1>
        <p>天氣 • 公車 • 捷運 • 高鐵 • 待辦</p>
      </header>

      <nav className="tabs">
        {[
          { id: 'weather', label: '天氣', icon: '☀️' },
          { id: 'bus', label: '公車', icon: '🚌' },
          { id: 'mrt', label: '捷運', icon: '🚇' },
          { id: 'hsr', label: '高鐵', icon: '🚄' },
          { id: 'habit', label: '待辦', icon: '📝' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
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
