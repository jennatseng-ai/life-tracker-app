import { useState, useEffect } from 'react';
import { getBusArrivals, hasTdxKey } from '../tdx';

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
    case 1: return { text: '尚未發車', soon: false };
    case 2: return { text: '交管不停', soon: false };
    case 3: return { text: '末班已過', soon: false };
    case 4: return { text: '今日未營運', soon: false };
    default: return { text: '無資料', soon: false };
  }
}

const FAV_KEY = 'busFavorites';

export default function Bus() {
  const [route, setRoute] = useState('');
  const [routes, setRoutes] = useState(null); // 查詢結果(可能多條同名路線)
  const [queried, setQueried] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem(FAV_KEY)) || []);
    } catch { /* ignore */ }
  }, []);

  function saveFavorites(list) {
    setFavorites(list);
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  }

  async function searchBus(name = route) {
    const q = name.trim();
    if (!q) {
      setError('請輸入路線號');
      setRoutes(null);
      return;
    }
    if (!hasTdxKey()) {
      setError('尚未設定 TDX 金鑰，無法查詢即時資料');
      setRoutes(null);
      return;
    }
    setRoute(q);
    setLoading(true);
    setError('');
    setRoutes(null);
    try {
      const data = await getBusArrivals(q);
      if (!data.length) {
        setError(`找不到「${q}」這條路線，請確認台北市/新北市公車路線號是否正確。`);
        return;
      }
      setRoutes(data);
      setQueried(q);
    } catch {
      setError('查詢時發生問題，請稍後再試一次。');
    } finally {
      setLoading(false);
    }
  }

  const isFav = favorites.includes(queried);
  function toggleFav() {
    if (!queried) return;
    if (isFav) saveFavorites(favorites.filter((f) => f !== queried));
    else saveFavorites([...favorites, queried]);
  }

  const dirLabel = { 0: '去程', 1: '返程' };

  return (
    <div className="card">
      <h2>🚌 公車動態</h2>

      {favorites.length > 0 && (
        <div className="fav-row">
          <span className="fav-label">常用</span>
          {favorites.map((f) => (
            <button key={f} className="fav-chip" onClick={() => searchBus(f)}>
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="input-group">
        <input
          type="text"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchBus()}
          placeholder="輸入台北市/新北市公車路線號 (如: 39, 橘20)"
        />
        <button onClick={() => searchBus()} disabled={loading}>
          {loading ? '查詢中...' : '查詢'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {routes && (
        <>
          <div className="fav-toggle-row">
            <button className={`fav-toggle ${isFav ? 'on' : ''}`} onClick={toggleFav}>
              {isFav ? '★ 已加入常用' : '☆ 加入常用'}
            </button>
          </div>
          {routes.map((r, ri) =>
            [0, 1].map((dir) =>
              r.dirs[dir].length ? (
                <div className="result-card" key={`${ri}-${dir}`}>
                  <div className="result-title">
                    🚌 {r.routeName}　{dirLabel[dir]}
                  </div>
                  <div className="result-detail">
                    {r.dirs[dir].map((stop, i) => {
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
            )
          )}
        </>
      )}

      <div className="info-text">
        資料來源:TDX 運輸資料流通服務(台北市・新北市公車即時動態)
      </div>
    </div>
  );
}
