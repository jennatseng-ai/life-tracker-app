import { useState } from 'react';

export default function Bus() {
  const [route, setRoute] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const busDatabase = {
    '1': { name: '1路', stops: ['台北車站', '西門町', '新宿'], times: ['10:15', '10:32', '10:48'] },
    '2': { name: '2路', stops: ['市政府', '101', '南港軟體園區'], times: ['10:20', '10:40', '11:00'] },
    'F701': { name: 'F701', stops: ['板橋站', '中山高速公路', '桃園機場'], times: ['09:30', '10:00', '10:30'] },
    '131': { name: '131路', stops: ['烏日站', '中華路', '霧峰'], times: ['08:45', '09:15', '09:45'] },
    '605': { name: '605路', stops: ['台中火車站', '西屯區', '文心路'], times: ['11:10', '11:40', '12:10'] }
  };

  function searchBus() {
    if (!route.trim()) {
      setResult({ error: '請輸入路線號' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const busData = busDatabase[route];
      if (busData) {
        setResult({ success: true, data: busData });
      } else {
        setResult({ error: '找不到此路線。請檢查路線號是否正確。' });
      }
      setLoading(false);
    }, 300);
  }

  return (
    <div className="card">
      <h2>🚌 公車動態</h2>
      <div className="input-group">
        <input
          type="text"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchBus()}
          placeholder="輸入路線號 (如: 1, 2, F701)"
        />
        <button onClick={searchBus} disabled={loading}>
          {loading ? '查詢中...' : '查詢'}
        </button>
      </div>

      {result && (
        <>
          {result.error && <div className="error">{result.error}</div>}
          {result.success && (
            <div className="result-card">
              <div className="result-title">🚌 {result.data.name}</div>
              <div className="result-detail">
                {result.data.stops.map((stop, i) => (
                  <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{stop}</span>
                    <span style={{ color: '#667eea', fontWeight: '600' }}>{result.data.times[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="info-text">提示: 支援多個路線。輸入路線號後按查詢</div>
    </div>
  );
}
