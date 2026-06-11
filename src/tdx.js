// TDX 運輸資料流通服務 — 認證與公車到站查詢
// 金鑰由環境變數注入（本機 .env / 發佈時的 GitHub Secret），不寫死在程式裡。
const CLIENT_ID = import.meta.env.VITE_TDX_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_TDX_CLIENT_SECRET;

const AUTH_URL =
  'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
const API_BASE = 'https://tdx.transportdata.tw/api/basic';

// 在記憶體中快取 token，到期前重複使用
let cachedToken = null;
let tokenExpiry = 0;

export function hasTdxKey() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error('TDX 認證失敗');
  const data = await res.json();
  cachedToken = data.access_token;
  // 提早 60 秒視為過期，避免邊界問題
  tokenExpiry = now + (data.expires_in - 60) * 1000;
  return cachedToken;
}

// 查詢某城市某路線的即時到站資料
export async function getBusArrivals(routeName, city = 'Taipei') {
  const token = await getToken();
  const url =
    `${API_BASE}/v2/Bus/EstimatedTimeOfArrival/City/${city}/` +
    `${encodeURIComponent(routeName)}?%24format=JSON`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('查詢失敗');
  return res.json();
}
