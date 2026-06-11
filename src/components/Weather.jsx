import { useState, useEffect } from 'react';

// 想看哪些城市就改這份清單（名稱 + 經緯度）
const CITIES = [
  { name: 'sanchong', lat: 25.0614, lon: 121.4843, label: '新北市三重區' },
  { name: 'linkou', lat: 25.0775, lon: 121.3917, label: '新北市林口區' },
  { name: 'dali', lat: 24.0994, lon: 120.6775, label: '台中市大里區' }
];

export default function Weather() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 3600000); // 每小時更新
    return () => clearInterval(interval);
  }, []);

  async function fetchWeather() {
    try {
      const results = await Promise.all(
        CITIES.map(async (city) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=Asia/Taipei`
          );
          const result = await response.json();
          return {
            label: city.label,
            temp: Math.round(result.current.temperature_2m),
            code: result.current.weather_code
          };
        })
      );
      setCities(results);
      setLoading(false);
    } catch (err) {
      setError('無法載入天氣');
      setLoading(false);
    }
  }

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  };

  const getWeatherDesc = (code) => {
    if (code === 0) return '晴朗';
    if (code === 1) return '大致晴朗';
    if (code === 2) return '部分多雲';
    if (code === 3) return '陰天';
    if (code === 45 || code === 48) return '霧';
    if (code >= 51 && code <= 57) return '毛毛雨';
    if (code >= 61 && code <= 67) return '雨';
    if (code >= 71 && code <= 77) return '雪';
    if (code >= 80 && code <= 82) return '陣雨';
    if (code >= 95) return '雷暴';
    return '多雲';
  };

  if (loading) return <div className="card"><div className="loading">載入中...</div></div>;
  if (error) return <div className="card"><div className="loading">{error}</div></div>;

  return (
    <div className="card">
      <h2>今日天氣</h2>
      <div className="weather-grid">
        {cities.map((city) => (
          <div className="weather-card" key={city.label}>
            <h3>{city.label}</h3>
            <div className="weather-icon">{getWeatherIcon(city.code)}</div>
            <div className="weather-temp">{city.temp}°C</div>
            <div className="weather-desc">{getWeatherDesc(city.code)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
