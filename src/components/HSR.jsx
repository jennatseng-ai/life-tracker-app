import { useState } from 'react';
import { getThsrTimetable, THSR_STATIONS, todayStr, hasTdxKey } from '../tdx';

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

export default function HSR() {
  const [origin, setOrigin] = useState('1000'); // 台北
  const [dest, setDest] = useState('1070'); // 左營
  const [date, setDate] = useState(todayStr());
  const [from, setFrom] = useState(nowHHMM());
  const [trains, setTrains] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function query() {
    if (origin === dest) {
      setError('出發站和到達站不能相同');
      setTrains(null);
      return;
    }
    if (!hasTdxKey()) {
      setError('尚未設定 TDX 金鑰，無法查詢');
      return;
    }
    setLoading(true);
    setError('');
    setTrains(null);
    try {
      const data = await getThsrTimetable(origin, dest, date);
      setTrains(data.filter((t) => t.departure >= from));
    } catch {
      setError('查詢時發生問題，請稍後再試一次。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>🚄 高鐵時刻表</h2>

      <div className="input-group">
        <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
          {THSR_STATIONS.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <span style={{ alignSelf: 'center', color: '#9b988f' }}>→</span>
        <select value={dest} onChange={(e) => setDest(e.target.value)}>
          {THSR_STATIONS.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
        <button onClick={query} disabled={loading}>
          {loading ? '查詢中...' : '查詢'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {trains &&
        (trains.length ? (
          <div className="mrt-schedule">
            {trains.map((t, i) => (
              <div key={i} className="time-slot">
                <div className="time">{t.departure}</div>
                <div className="station">車次 {t.trainNo}　到站 {t.arrival}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="info-text" style={{ marginTop: '14px' }}>
            這個日期/時間之後沒有班次了。
          </div>
        ))}

      <div className="info-text">資料來源:TDX 運輸資料流通服務(台灣高鐵)</div>
    </div>
  );
}
