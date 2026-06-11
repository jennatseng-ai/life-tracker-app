import { useState, useEffect } from 'react';

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  function loadHabits() {
    const stored = localStorage.getItem('habits');
    if (stored) {
      setHabits(JSON.parse(stored));
    }
  }

  function addHabit() {
    if (!input.trim()) return;

    const newHabit = {
      id: Date.now(),
      name: input.trim(),
      createdDate: new Date().toISOString().split('T')[0],
      completedDates: []
    };

    const updated = [...habits, newHabit];
    setHabits(updated);
    localStorage.setItem('habits', JSON.stringify(updated));
    setInput('');
  }

  function toggleHabit(id) {
    const today = new Date().toISOString().split('T')[0];
    const updated = habits.map(habit => {
      if (habit.id === id) {
        const index = habit.completedDates.indexOf(today);
        return {
          ...habit,
          completedDates: index > -1
            ? habit.completedDates.filter(d => d !== today)
            : [...habit.completedDates, today]
        };
      }
      return habit;
    });
    setHabits(updated);
    localStorage.setItem('habits', JSON.stringify(updated));
  }

  function deleteHabit(id) {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    localStorage.setItem('habits', JSON.stringify(updated));
  }

  function calculateStreak(habit) {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card">
      <h2>✓ 每日習慣追蹤</h2>
      <div className="add-habit">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addHabit()}
          placeholder="新增習慣 (如: 喝水, 運動, 閱讀)"
        />
        <button onClick={addHabit}>新增</button>
      </div>

      <div className="habit-list">
        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            尚無習慣。新增一個開始追蹤吧！
          </div>
        ) : (
          habits.map(habit => {
            const isDone = habit.completedDates.includes(today);
            const streak = calculateStreak(habit);
            return (
              <div key={habit.id} className="habit-item">
                <div className="habit-info">
                  <h3>{isDone ? '✓' : '○'} {habit.name}</h3>
                  <div className="habit-progress">連續 {streak} 天</div>
                </div>
                <div className="habit-actions">
                  <button
                    className={`habit-btn ${isDone ? 'done' : ''}`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    {isDone ? '已完成' : '完成'}
                  </button>
                  <button
                    className="habit-btn delete"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    刪除
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
