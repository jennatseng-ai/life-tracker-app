import { useState } from 'react';
import { getMetroLiveBoard, TYMC_STATIONS, hasTdxKey } from '../tdx';

function fmt(sec) {
  if (sec == null) return '—';
  if (sec <= 60) return '即將進站';
  return `${Math.floor(sec / 60)} 分`;
}

export default function MRT() {
  const [station, setStation] = useState('A1');
  const [trains, setTrains] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function query(stationId = station) {
    if (!hasTdxKey()) {
      setError('尚未設定 TDX 金鑰，無法查詢即時資料');
      return;
    }
    setLoading(true);
    setError('');
    setTrains(null);
    try {
      const board = await getMetroLiveBoard();
      const here = board
        .filter((b) => b.StationID === stationId)
        .sort((a, b) => (a.EstimateTime ?? 9999) - (b.EstimateTime ?? 9999));
      setTrains(here);
    } catch {
      setError('查詢時發生問題，請稍後再試一次。');
    } finally {
      setLoading(false);
    }
  }

  const stationName = TYMC_STATIONS.find(([id]) => id === station)?.[1] || '';

  return (
    <div className="card">
      <h2>🚇 機場捷運即時到站</h2>
      <div className="input-group">
        <select
          value={station}
          onChange={(e) => {
            setStation(e.target.value);
            setTrains(null);
          }}
        >
          {TYMC_STATIONS.map(([id, name]) => (
            <option key={id} value={id}>
              {id}　{name}
            </option>
          ))}
        </select>
        <button onClick={() => query()} disabled={loading}>
          {loading ? '查詢中...' : '查詢'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {trains &&
        (trains.length ? (
          <div className="mrt-schedule">
            {trains.map((t, i) => (
              <div key={i} className="time-slot">
                <div className="time">{fmt(t.EstimateTime)}</div>
                <div className="station">
                  {t.TripHeadSign || t.DestinationStationName?.Zh_tw || ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="info-text" style={{ marginTop: '14px' }}>
            「{stationName}」目前查無即將進站的班次,請稍後再試。
          </div>
        ))}

      <div className="info-text">
        資料來源:TDX 運輸資料流通服務(桃園機場捷運即時動態)
      </div>
    </div>
  );
}
