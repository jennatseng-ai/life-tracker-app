# 📱 生活助手 (Life Tracker App)

一個整合天氣、公車動態、機場捷運時刻表和習慣追蹤的生活工具應用。

## ✨ 功能

- **☀️ 天氣** — 實時顯示新北市和台中市的溫度和天氣狀況
- **🚌 公車查詢** — 查詢公車路線和班次時刻
- **🚇 機場捷運** — 查詢往返台北和桃園機場的捷運時刻表
- **✓ 習慣追蹤** — 每日習慣記錄，自動計算連續天數

## 🛠️ 技術棧

- **React 18** — UI 框架
- **Vite** — 快速開發伺服器和構建工具
- **CSS3** — 響應式設計
- **LocalStorage** — 習慣資料本地存儲

## 📦 安裝

```bash
# 克隆倉庫
git clone https://github.com/jennatseng-ai/life-tracker-app.git

# 進入目錄
cd life-tracker-app

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開發伺服器將在 `http://localhost:5174/` 上運行。

## 📱 使用

1. **天氣** — 自動顯示新北市和台中市的實時天氣
2. **公車** — 輸入路線號 (如: 1, 2, F701) 進行查詢
3. **捷運** — 選擇方向查詢機場捷運時刻表
4. **習慣** — 新增習慣，每天點擊「完成」進行追蹤

## 📁 目錄結構

```
src/
├── App.jsx                 # 主應用元件
├── App.css                 # 應用樣式
├── components/
│   ├── Weather.jsx        # 天氣元件
│   ├── Bus.jsx            # 公車查詢元件
│   ├── MRT.jsx            # 捷運時刻元件
│   └── HabitTracker.jsx   # 習慣追蹤元件
├── index.css              # 全局樣式
└── main.jsx               # 應用入口
```

## 🚀 構建

```bash
npm run build
```

構建結果將在 `dist/` 目錄中。

## 📝 開發注意事項

- 天氣數據使用免費的 Open-Meteo API
- 公車和捷運資料目前為模擬數據，可根據需要接入真實 API
- 習慣追蹤數據存儲在瀏覽器的 LocalStorage 中

## 🔄 後續計劃

- [ ] 接入真實公車 API (台北/台中)
- [ ] 接入真實捷運 API (機場捷運)
- [ ] 習慣統計圖表
- [ ] 天氣預警通知
- [ ] 路線規劃功能
- [ ] React Native / Expo 轉換為原生應用

## 📄 License

MIT

---

有任何問題或建議，歡迎提出 Issue 或 Pull Request!
