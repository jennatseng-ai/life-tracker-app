import { useState } from 'react';
import { getMetroTimetable, TYMC_STATIONS, todayStr, hasTdxKey } from '../tdx';

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}
function plusHours(hhmm, h) {
  const [hh, mm] = hhmm.split(':').map(Number);
  const t = Math.min(hh + h, 23) * 60 + mm;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(
    t % 60
  ).padStart(2, '0')}`;
}

export default function MRT() {
  const start = nowHHMM();
  const [origin, setOrigin] = useState('A1');
  const [dest, setDest] = useState('A13');
  const [date, setDate] = useState(todayStr());
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(plusHours(start, 3));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function query() {
    if (origin === dest) {
      setError('起站和訖站不能相同');
      setResult(null);
      return;
    }
    if (!hasTdxKey()) {
      setError('尚未設定 TDX 金鑰，無法查詢');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { trains, durationMin } = await getMetroTimetable(origin, dest, date);
      const inWindow = trains.filter(
        (t) => t.departure >= from && t.departure <= to
      );
      setResult({ trains: inWindow, durationMin });
    } catch {
      setError('查詢時發生問題，請稍後再試一次。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>🚇 機場捷運時刻查詢</h2>

      <div className="input-group">
        <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
          {TYMC_STATIONS.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <span style={{ alignSelf: 'center', color: '#9b988f' }}>→</span>
        <select value={dest} onChange={(e) => setDest(e.target.value)}>
          {TYMC_STATIONS.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span style={{ alignSelf: 'center', color: '#9b988f' }}>~</span>
        <input type="time" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={query} disabled={loading}>
          {loading ? '查詢中...' : '查詢'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result &&
        (result.trains.length ? (
          <>
            {result.durationMin != null && (
              <div className="info-text" style={{ marginBottom: '6px' }}>
                行車時間約 {result.durationMin} 分・共 {result.trains.length} 班
              </div>
            )}
            <div className="mrt-schedule">
              {result.trains.map((t, i) => (
                <div key={i} className="time-slot">
                  <div className="time">{t.departure}</div>
                  <div className="station">到站 {t.arrival || '—'}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="info-text" style={{ marginTop: '14px' }}>
            此時段沒有班次,試試調整日期或時間範圍。
          </div>
        ))}

      <div className="info-text">
        資料來源:TDX(普通車班表,到站時間為估算)
      </div>
    </div>
  );
}
