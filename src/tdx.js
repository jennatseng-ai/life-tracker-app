// TDX 運輸資料流通服務 — 認證 + 公車 / 機場捷運 / 高鐵
const CLIENT_ID = import.meta.env.VITE_TDX_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_TDX_CLIENT_SECRET;

const AUTH_URL =
  'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
const API_BASE = 'https://tdx.transportdata.tw/api/basic';

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
  tokenExpiry = now + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function apiGet(path) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('查詢失敗');
  return res.json();
}

function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  let total = h * 60 + m + mins;
  total %= 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(
    total % 60
  ).padStart(2, '0')}`;
}

// ---------- 公車 ----------
export async function getBusArrivals(routeName) {
  const cities = ['Taipei', 'NewTaipei'];
  const lists = await Promise.all(
    cities.map((city) =>
      apiGet(
        `/v2/Bus/EstimatedTimeOfArrival/City/${city}/${encodeURIComponent(
          routeName
        )}?%24format=JSON`
      ).catch(() => [])
    )
  );
  const exact = lists.flat().filter((s) => s.RouteName?.Zh_tw === routeName);

  const groups = {};
  for (const s of exact) {
    const uid = s.RouteUID || s.RouteName?.Zh_tw;
    if (!groups[uid]) {
      groups[uid] = { routeName: s.RouteName?.Zh_tw, dirs: { 0: [], 1: [] } };
    }
    const dir = groups[uid].dirs[s.Direction];
    if (!dir) continue;
    const key = s.StopUID || s.StopID;
    if (dir.some((x) => (x.StopUID || x.StopID) === key)) continue;
    dir.push(s);
  }
  for (const g of Object.values(groups)) {
    for (const d of [0, 1]) {
      g.dirs[d].sort((a, b) => (a.StopSequence || 0) - (b.StopSequence || 0));
    }
  }
  return Object.values(groups);
}

// ---------- 機場捷運 (桃園捷運 TYMC) ----------
export const TYMC_STATIONS = [
  ['A1', '台北車站'], ['A2', '三重站'], ['A3', '新北產業園區站'],
  ['A4', '新莊副都心站'], ['A5', '泰山站'], ['A6', '泰山貴和站'],
  ['A7', '體育大學站'], ['A8', '長庚醫院站'], ['A9', '林口站'],
  ['A10', '山鼻站'], ['A11', '坑口站'], ['A12', '機場第一航廈站'],
  ['A13', '機場第二航廈站'], ['A14a', '機場旅館站'], ['A15', '大園站'],
  ['A16', '橫山站'], ['A17', '領航站'], ['A18', '高鐵桃園站'],
  ['A19', '桃園體育園區站'], ['A20', '興南站'], ['A21', '環北站'],
];

// 機場捷運：查兩站之間某日的班次（出發/到站時間）
export async function getMetroTimetable(originID, destID, dateStr) {
  const order = TYMC_STATIONS.map((s) => s[0]);
  const oi = order.indexOf(originID);
  const di = order.indexOf(destID);
  if (oi < 0 || di < 0 || oi === di) return { trains: [], durationMin: null };
  const dir = di > oi ? 0 : 1;

  const d = new Date(`${dateStr}T00:00:00`);
  const tag = d.getDay() === 0 || d.getDay() === 6 ? '假日' : '平日';

  const [tables, s2s] = await Promise.all([
    apiGet(
      `/v2/Rail/Metro/StationTimeTable/TYMC?%24filter=StationID%20eq%20'${originID}'&%24format=JSON`
    ),
    apiGet('/v2/Rail/Metro/S2STravelTime/TYMC?%24format=JSON'),
  ]);

  const segs = s2s[0]?.TravelTimes || [];
  const seg = segs.find(
    (x) => x.FromStationID === originID && x.ToStationID === destID
  );
  const durationSec = seg ? (seg.RunTime || 0) + (seg.StopTime || 0) : null;
  const durationMin = durationSec != null ? Math.round(durationSec / 60) : null;

  const reach = (trainDestID) => {
    const ti = order.indexOf(trainDestID);
    if (ti < 0) return true; // 終點站在延伸段(如老街溪)→ 視為可達
    return dir === 0 ? ti >= di : ti <= di;
  };

  const deps = new Set();
  for (const t of tables) {
    if (t.Direction !== dir) continue;
    if (t.ServiceDay?.ServiceTag !== tag) continue;
    if (!reach(t.DestinationStaionID)) continue;
    for (const x of t.Timetables || []) {
      if (x.TrainType !== 2) continue; // 普通車(每站皆停)
      deps.add(x.DepartureTime);
    }
  }
  const trains = [...deps].sort().map((dep) => ({
    departure: dep,
    arrival: durationMin != null ? addMinutes(dep, durationMin) : null,
  }));
  return { trains, durationMin };
}

// ---------- 高鐵 (THSR) ----------
export const THSR_STATIONS = [
  ['0990', '南港'], ['1000', '台北'], ['1010', '板橋'], ['1020', '桃園'],
  ['1030', '新竹'], ['1035', '苗栗'], ['1040', '台中'], ['1043', '彰化'],
  ['1047', '雲林'], ['1050', '嘉義'], ['1060', '台南'], ['1070', '左營'],
];

export function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// 高鐵 起訖站 指定日期的時刻表
export async function getThsrTimetable(originID, destID, dateStr) {
  const date = dateStr || todayStr();
  const data = await apiGet(
    `/v2/Rail/THSR/DailyTimetable/OD/${originID}/to/${destID}/${date}?%24format=JSON`
  );
  return data.map((t) => ({
    trainNo: t.DailyTrainInfo?.TrainNo,
    departure: t.OriginStopTime?.DepartureTime,
    arrival: t.DestinationStopTime?.ArrivalTime,
  }));
}
