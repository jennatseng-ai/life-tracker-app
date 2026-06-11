import { useState } from 'react';
import { getBusArrivals, hasTdxKey } from '../tdx';

// 把 TDX 的到站狀態 + 秒數轉成好懂的文字
function formatArrival(stop) {
  switch (stop.StopStatus) {
    case 0: {
      const sec = stop.EstimateTime;
      if (sec == null) return { text: '—', soon: false };
      if (sec <= 30) return { text: '進站中', soon: true };
      const min = Math.floor(sec / 60);
      if (min === 0) return { text: '即將到站', soon: true };
      return { text: `${min} 分`, soon: min <= 3 };
    }
    case 1:
      return { text: '尚未發車', soon: false };
    case 2:
      return { text: '交管不停', soon: false };
    case 3:
      return { text: '末班已過', soon: false };
    case 4:
      return { text: '今日未營運', soon: false };
    default:
      return { text: '無資料', soon: false };
  }
}

export default function Bus() {
  const [route, setRoute] = useState('');
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function searchBus() {
    const name = route.trim();
    if (!name) {
      setError('請輸入路線號');
      setDirections(null);
      return;
    }
    if (!hasTdxKey()) {
      setError('尚未設定 TDX 金鑰，無法查詢即時資料');
      setDirections(null);
      return;
    }

    setLoading(true);
    setError('');
    setDirections(null);
    try {
      const data = await getBusArrivals(name);
      if (!data.length) {
        setError(`找不到「${name}」這條路線，請確認台北市公車路線號是否正確。`);
        return;
      }
      // 依方向(0 去程 / 1 返程)分組，組內依站序排序
      const groups = { 0: [], 1: [] };
      for (const s of data) {
        if (groups[s.Direction]) groups[s.Direction].push(s);
      }
      for (const dir of Object.keys(groups)) {
        groups[dir].sort((a, b) => (a.StopSequence || 0) - (b.StopSequence || 0));
      }
      setDirections(groups);
    } catch (err) {
      setError('查詢時發生問題，請稍後再試一次。');
    } finally {
      setLoading(false);
    }
  }

  const dirLabel = { 0: '去程', 1: '返程' };

  return (
    <div className="card">
      <h2>🚌 公車動態</h2>
      <div className="input-group">
        <input
          type="text"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchBus()}
          placeholder="輸入台北市公車路線號 (如: 299, 672)"
        />
        <button onClick={searchBus} disabled={loading}>
          {loading ? '查詢中...' : '查詢'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {directions &&
        [0, 1].map((dir) =>
          directions[dir].length ? (
            <div className="result-card" key={dir}>
              <div className="result-title">
                🚌 {route.trim()}　{dirLabel[dir]}
              </div>
              <div className="result-detail">
                {directions[dir].map((stop, i) => {
                  const a = formatArrival(stop);
                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <span>{stop.StopName?.Zh_tw}</span>
                      <span
                        style={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          color: a.soon ? '#cf8071' : '#2b2b2b',
                        }}
                      >
                        {a.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null
        )}

      <div className="info-text">
        資料來源:TDX 運輸資料流通服務(台北市公車即時動態)
      </div>
    </div>
  );
}
