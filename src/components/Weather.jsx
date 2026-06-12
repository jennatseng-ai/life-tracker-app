import { useState, useEffect } from 'react';

const CITIES = [
  { lat: 25.0614, lon: 121.4843, label: '新北市三重區' },
  { lat: 25.0775, lon: 121.3917, label: '新北市林口區' },
  { lat: 24.0994, lon: 120.6775, label: '台中市大里區' },
];

function icon(code) {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}
function desc(code) {
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
}
function uvLevel(uv) {
  if (uv == null) return '';
  if (uv < 3) return '低';
  if (uv < 6) return '中';
  if (uv < 8) return '高';
  if (uv < 11) return '過量';
  return '危險';
}
const WD = ['日', '一', '二', '三', '四', '五', '六'];

function HourlyChart({ hours }) {
  const temps = hours.map((h) => h.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;
  const colW = 52;
  const W = hours.length * colW;
  const H = 150;
  const top = 34;
  const bottom = 96;
  const pts = hours.map((h, i) => {
    const x = i * colW + colW / 2;
    const y = bottom - ((h.temp - min) / span) * (bottom - top);
    return { x, y, ...h };
  });
  const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <div className="chart-scroll">
      <svg width={W} height={H} className="hourly-chart">
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--accent)" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="c-temp">
              {p.temp}°
            </text>
            <text x={p.x} y={H - 22} textAnchor="middle" className="c-time">
              {p.time}
            </text>
            <text x={p.x} y={H - 6} textAnchor="middle" className="c-rain">
              💧{p.rain ?? 0}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Weather() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
    const t = setInterval(fetchWeather, 3600000);
    return () => clearInterval(t);
  }, []);

  async function fetchWeather() {
    try {
      const results = await Promise.all(
        CITIES.map(async (city) => {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
              `&current=temperature_2m,weather_code,relative_humidity_2m,apparent_temperature` +
              `&hourly=temperature_2m,precipitation_probability,weather_code,uv_index` +
              `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
              `&timezone=Asia%2FTaipei&forecast_days=7`
          );
          const r = await res.json();
          let start = r.hourly.time.indexOf(r.current.time.slice(0, 13) + ':00');
          if (start < 0) start = 0;
          const hours = [];
          for (let i = start; i < start + 12 && i < r.hourly.time.length; i++) {
            hours.push({
              time: r.hourly.time[i].slice(11, 16),
              temp: Math.round(r.hourly.temperature_2m[i]),
              rain: r.hourly.precipitation_probability[i],
              code: r.hourly.weather_code[i],
            });
          }
          const week = r.daily.time.map((d, i) => ({
            wd: WD[new Date(`${d}T00:00:00`).getDay()],
            md: d.slice(5).replace('-', '/'),
            code: r.daily.weather_code[i],
            hi: Math.round(r.daily.temperature_2m_max[i]),
            lo: Math.round(r.daily.temperature_2m_min[i]),
            rain: r.daily.precipitation_probability_max[i],
          }));
          return {
            label: city.label,
            temp: Math.round(r.current.temperature_2m),
            code: r.current.weather_code,
            feels: Math.round(r.current.apparent_temperature),
            humidity: r.current.relative_humidity_2m,
            uv: r.hourly.uv_index ? Math.round(r.hourly.uv_index[start]) : null,
            hours,
            week,
          };
        })
      );
      setCities(results);
      setLoading(false);
    } catch {
      setError('無法載入天氣');
      setLoading(false);
    }
  }

  if (loading) return <div className="card"><div className="loading">載入中...</div></div>;
  if (error) return <div className="card"><div className="loading">{error}</div></div>;

  return (
    <div className="card">
      <h2>今日天氣</h2>
      {cities.map((city) => (
        <div className="weather-city" key={city.label}>
          <div className="weather-now">
            <span className="weather-now-icon">{icon(city.code)}</span>
            <div className="weather-now-text">
              <div className="weather-now-name">{city.label}</div>
              <div className="weather-now-desc">{desc(city.code)}</div>
            </div>
            <div className="weather-now-temp">{city.temp}°</div>
          </div>

          <div className="weather-stats">
            <div className="stat">
              <div className="stat-label">體感</div>
              <div className="stat-value">{city.feels}°</div>
            </div>
            <div className="stat">
              <div className="stat-label">濕度</div>
              <div className="stat-value">{city.humidity}%</div>
            </div>
            <div className="stat">
              <div className="stat-label">紫外線</div>
              <div className="stat-value">
                {city.uv ?? '—'} {uvLevel(city.uv)}
              </div>
            </div>
          </div>

          <HourlyChart hours={city.hours} />

          <div className="week-forecast">
            {city.week.map((d, i) => (
              <div className="week-row" key={i}>
                <span className="week-day">週{d.wd}</span>
                <span className="week-date">{d.md}</span>
                <span className="week-icon">{icon(d.code)}</span>
                <span className="week-rain">💧{d.rain ?? 0}%</span>
                <span className="week-temp">
                  {d.hi}° <span className="week-lo">{d.lo}°</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
