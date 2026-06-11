import { useState, useEffect } from 'react';

export default function Weather() {
  const [weather, setWeather] = useState({
    newtaipei: null,
    taichung: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 3600000); // 每小時更新
    return () => clearInterval(interval);
  }, []);

  async function fetchWeather() {
    try {
      const cities = [
        { name: 'newtaipei', lat: 25.0443, lon: 121.4627, label: '新北市' },
        { name: 'taichung', lat: 24.1477, lon: 120.6736, label: '台中市' }
      ];

      const data = {};
      for (const city of cities) {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=Asia/Taipei`
        );
        const result = await response.json();
        data[city.name] = {
          temp: Math.round(result.current.temperature_2m),
          code: result.current.weather_code,
          label: city.label
        };
      }
      setWeather({ ...data, loading: false });
    } catch (err) {
      setWeather(prev => ({ ...prev, error: '無法載入天氣', loading: false }));
    }
  }

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 85) return '❄️';
    if (code >= 80 && code <= 82) return '⛈️';
    return '🌤️';
  };

  const getWeatherDesc = (code) => {
    const descriptions = {
      0: '晴朗', 1: '大致晴朗', 2: '部分多雲', 3: '陰天',
      45: '霧', 48: '凍霧', 51: '毛毛雨', 61: '雨',
      71: '雪', 80: '陣雨', 81: '傾盆大雨', 95: '雷暴'
    };
    return descriptions[code] || '多雲';
  };

  if (weather.loading) return <div className="card"><div className="loading">載入中...</div></div>;

  return (
    <div className="card">
      <h2>今日天氣</h2>
      <div className="weather-grid">
        {weather.newtaipei && (
          <div className="weather-card">
            <h3>{weather.newtaipei.label}</h3>
            <div className="weather-icon">{getWeatherIcon(weather.newtaipei.code)}</div>
            <div className="weather-temp">{weather.newtaipei.temp}°C</div>
            <div className="weather-desc">{getWeatherDesc(weather.newtaipei.code)}</div>
          </div>
        )}
        {weather.taichung && (
          <div className="weather-card">
            <h3>{weather.taichung.label}</h3>
            <div className="weather-icon">{getWeatherIcon(weather.taichung.code)}</div>
            <div className="weather-temp">{weather.taichung.temp}°C</div>
            <div className="weather-desc">{getWeatherDesc(weather.taichung.code)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
