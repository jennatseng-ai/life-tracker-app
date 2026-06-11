import { useState } from 'react';

export default function MRT() {
  const [direction, setDirection] = useState('');
  const [result, setResult] = useState(null);

  const schedules = {
    'to-taoyuan': [
      { time: '10:15', from: '台北車站', to: '桃園機場第一航廈' },
      { time: '10:30', from: '台北車站', to: '桃園機場第一航廈' },
      { time: '10:45', from: '台北車站', to: '桃園機場第一航廈' },
      { time: '11:00', from: '台北車站', to: '桃園機場第一航廈' },
      { time: '11:15', from: '台北車站', to: '桃園機場第一航廈' }
    ],
    'to-taipei': [
      { time: '10:20', from: '桃園機場第二航廈', to: '台北車站' },
      { time: '10:35', from: '桃園機場第二航廈', to: '台北車站' },
      { time: '10:50', from: '桃園機場第二航廈', to: '台北車站' },
      { time: '11:05', from: '桃園機場第二航廈', to: '台北車站' },
      { time: '11:20', from: '桃園機場第二航廈', to: '台北車站' }
    ]
  };

  function getMRTSchedule() {
    if (!direction) {
      setResult(null);
      return;
    }
    setResult(schedules[direction]);
  }

  return (
    <div className="card">
      <h2>🚇 機場捷運時刻</h2>
      <div className="input-group">
        <select
          value={direction}
          onChange={(e) => {
            setDirection(e.target.value);
            if (e.target.value) {
              setTimeout(() => setResult(schedules[e.target.value]), 100);
            } else {
              setResult(null);
            }
          }}
          style={{ flex: 1, padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
        >
          <option value="">選擇方向</option>
          <option value="to-taoyuan">往桃園機場</option>
          <option value="to-taipei">往台北車站</option>
        </select>
      </div>

      {result && (
        <div className="mrt-schedule">
          {result.map((schedule, i) => (
            <div key={i} className="time-slot">
              <div className="time">{schedule.time}</div>
              <div className="station">{schedule.from} → {schedule.to}</div>
            </div>
          ))}
        </div>
      )}

      <div className="info-text">顯示接下來的班次時刻表</div>
    </div>
  );
}
