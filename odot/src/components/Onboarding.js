import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import './Onboarding.css';

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    sleepSchedule: { wakeTime: '07:00', bedTime: '23:00'},
    workStyle: [],
    energyPeaks: [],
    shortTermGoals: [],
    longTermGoals: [],
    dailyTodos: [],
    preferences: {
      breakFrequency: '60',
      focusSessionLength: '25',
      exerciseTime: ''
    }
  });
  const [currentTodo, setCurrentTodo] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [goalPrompts, setGoalPrompts] = useState({
    short: [],
    long: []
  });
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Auto-generate goals when reaching step 5
  useEffect(() => {
    if (step === 5 && goalPrompts.short.length === 0) {
      generateGoalPrompts();
    }
  }, [step]);

  //predefined options
  const roleOps = [
    { id: 'highschool-student', label: 'HighSchool Student'},
    { id: 'uni-student', label: 'University Student'},
    { id: 'employed', label: 'Employed'}
  ];

  const workStyleOps = [
    { id: 'deep-focus', label: 'Deep Focus Sessions', desc: 'Long uninterrupted work periods'},
    { id: 'short-bursts', label: 'Short Bursts', desc: 'Quick, intense work periods'},
    { id: 'collaborative', label: 'Collaborative', desc: 'Team-based work sessions'},
    { id: 'flexible', label: 'Flexible', desc: 'Adaptable schedule, uses a combination and has no distinct preference'}
  ];

  const energyPeaksOps = [
    { id: 'early-morning', label: 'Early Morning (5 - 8am)', time: '5-8'},
    { id: 'morning', label: 'Morning (8 - 11am)', time: '8-11'},
    { id: 'midday', label: 'Midday (11am - 2pm)', time: '11-14'},
    { id: 'afternoon', label: 'Afternoon (2 - 5pm)', time: '14-17'},
    { id: 'evening', label: 'Evening (5 - 8pm)', time: '17-20'},
    { id: 'night', label: 'Night (8 - 11pm)', time: '20-23'},
    { id: 'ungodly', label: 'Ungodly (11pm - 5am)', time: '23-5'}
  ];

  const toggleSelection = (category, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const generateGoalPrompts = async () => {
    setLoadingGoals(true);
    const prompt = `
You are a life coach helping someone set goals. Based on their profile, suggest personalized goals.
User Profile:
- Name: ${formData.name}
- Role: ${formData.role}
- Work Style: ${formData.workStyle.join(', ')}
- Peak Energy: ${formData.energyPeaks.join(', ')}

Generate 7 short-term goals (this week/month) and 4 long term goals (this year+) that would be relevant for this person.
Make them specific, actionable, and personalized to their work style and patterns.

Respond ONLY with valid JSON:
{ 
  "short": ["goal 1", "goal 2", "goal 3", "goal 4", "goal 5", "goal 6", "goal 7"],
  "long": ["goal 1", "goal 2", "goal 3", "goal 4"]
}`;
    
    try {
      const result = await window.electronAPI.fetchAPI(prompt);
      const goals = JSON.parse(result.choices[0].message.content);
      setGoalPrompts(goals);
    } catch (error) {
      console.error('Error generating goals:', error);
      // Fallback to default goals
      setGoalPrompts({
        short: [
          'Complete a project this week',
          'Learn a new skill',
          'Exercise 3x this week',
          'Read a book',
          'Organize workspace',
          'Network with 5 people',
          'Finish pending tasks'
        ],
        long: [
          'Career advancement',
          'Start a business',
          'Master a skill',
          'Health & fitness transformation'
        ]
      });
    } finally {
      setLoadingGoals(false);
    }
  };

  const addTodo = () => {
    if (currentTodo.trim()) {
      setFormData(prev => ({
        ...prev,
        dailyTodos: [...prev.dailyTodos, {
          id: Date.now(),
          text: currentTodo,
          completed: false,
          priority: 'medium'
        }]
      }));
      setCurrentTodo('');
    }
  };

  const removeTodo = (id) => {
    setFormData(prev => ({
      ...prev,
      dailyTodos: prev.dailyTodos.filter(todo => todo.id !== id)
    }));
  };

  const startEditTodo = (todo) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  const saveEditTodo = () => {
    if (editingTodoText.trim()) {
      setFormData(prev => ({
        ...prev,
        dailyTodos: prev.dailyTodos.map(todo =>
          todo.id === editingTodoId ? { ...todo, text: editingTodoText } : todo
        )
      }));
    }
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  const cancelEditTodo = () => {
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  const generateSmartTimetable = async () => {
    setIsGenerating(true);
    
    console.log('Starting timetable generation with data:', formData);
    
    const prompt = `
You are an AI scheduling assistant. Generate a smart daily timetable based on this user profile:
Name: ${formData.name}
Role: ${formData.role}
Sleep Schedule: Wake up at ${formData.sleepSchedule.wakeTime}, sleeps at ${formData.sleepSchedule.bedTime}
Work Style: ${formData.workStyle.join(', ')}
Energy Peaks: ${formData.energyPeaks.join(', ')}
Break Frequency: Every ${formData.preferences.breakFrequency} minutes
Focus Session Length: ${formData.preferences.focusSessionLength} minutes
Exercise Preference: ${formData.preferences.exerciseTime || 'Not specified'}
Short-Term Goals: ${formData.shortTermGoals.join(', ')}
Long-Term Goals: ${formData.longTermGoals.join(', ')}

Their tasks today are:
${formData.dailyTodos.map((todo, i) => `${i + 1}. ${todo.text}`).join('\n')}

Create an optimized schedule that places demanding tasks during peak energy times, includes strategic breaks, respects
their work style, allocates a reasonable and explainable amount of time for each todo item, includes buffer time and transitions 
and adds exercise/movement if preferred by the user or stated as one of their goals.

Respond ONLY with valid JSON in this exact format:
{
  "schedule": [
    {
      "time": "07:00",
      "duration": 30,
      "activity": "Morning Routine",
      "type": "personal",
      "reason": "Start day with calm preparation"
    }
  ],
  "insights": {
    "productivity_score": "8/10",
    "schedule_philosophy": "Your most important work is scheduled during your peak energy hours",
    "tips": ["Tip 1", "Tip 2"]
  }
}`;

    try {
      console.log('Sending API request...');
      const result = await window.electronAPI.fetchAPI(prompt);
      console.log('API Response:', result);
      
      // Handle the response - it might be structured differently
      let content = result.choices?.[0]?.message?.content || result.content || result;
      console.log('Raw content:', content);
      
      // Clean up any markdown code blocks
      if (typeof content === 'string') {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const aiResponse = JSON.parse(content);
      console.log('Parsed response:', aiResponse);
      
      //save everything
      const userData = {
        ...formData,
        timetable: aiResponse,
        createdAt: Date.now() 
      };

      console.log('Saving user data:', userData);
      //save to file
      await window.electronAPI.saveUserData(userData);
      
      console.log('Navigating to timetable...');
      navigate('/timetable', { state: { timetable: aiResponse } });
    } catch (error) {
      console.error('Error generating timetable:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to generate timetable: ${error.message}\n\nCheck console for details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-onboarding">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / 7) * 100}%` }}></div>
      </div>

      {step === 1 && (
        <div className="onboarding-step">
          <h1>Welcome! Let's get to know you!</h1>
          <div className="form-group">
            <label>What should we call you?</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="text-input"
            />
          </div>

          <div className="form-group">
            <label>When do you typically wake up?</label>
            <input
              type="time"
              value={formData.sleepSchedule.wakeTime}
              onChange={(e) => setFormData({
                ...formData,
                sleepSchedule: { ...formData.sleepSchedule, wakeTime: e.target.value }
              })}
              className="time-input"
            />
          </div>

          <div className="form-group">
            <label>When do you go to bed?</label>
            <input
              type="time"
              value={formData.sleepSchedule.bedTime}
              onChange={(e) => setFormData({
                ...formData,
                sleepSchedule: { ...formData.sleepSchedule, bedTime: e.target.value }
              })}
              className="time-input"
            />
          </div>

          <button 
            onClick={() => setStep(2)} 
            disabled={!formData.name}
            className="next-btn"
          >
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-step">
          <h2>What role do you occupy?</h2>
          <div className="option-grid">
            {roleOps.map(option => (
              <div
                key={option.id}
                className={`option-card ${formData.role === option.id ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: option.id })}
              >
                <div className="option-label">{option.label}</div>
              </div>
            ))}
          </div>

          <div className="nav-buttons">
            <button onClick={() => setStep(1)} className="back-btn">← Back</button>
            <button 
              onClick={() => setStep(3)} 
              disabled={!formData.role}
              className="next-btn"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="onboarding-step">
          <h2>How do you work best?</h2>
          <p className="subtitle">Select all that apply</p>
          
          <div className="option-grid">
            {workStyleOps.map(option => (
              <div
                key={option.id}
                className={`option-card ${formData.workStyle.includes(option.id) ? 'selected' : ''}`}
                onClick={() => toggleSelection('workStyle', option.id)}
              >
                <div className="option-label">{option.label}</div>
                <div className="option-desc">{option.desc}</div>
              </div>
            ))}
          </div>

          <div className="nav-buttons">
            <button onClick={() => setStep(2)} className="back-btn">← Back</button>
            <button 
              onClick={() => setStep(4)} 
              disabled={formData.workStyle.length === 0}
              className="next-btn"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="onboarding-step">
          <h2>When is your energy highest?</h2>
          <p className="subtitle">Select all that apply</p>
          <div className="option-grid">
            {energyPeaksOps.map(option => (
              <div
                key={option.id}
                className={`option-card ${formData.energyPeaks.includes(option.id) ? 'selected' : ''}`}
                onClick={() => toggleSelection('energyPeaks', option.id)}
              >
                <div className="option-label">{option.label}</div>
              </div>
            ))}
          </div>

          <div className="nav-buttons">
            <button onClick={() => setStep(3)} className="back-btn">← Back</button>
            <button 
              onClick={() => setStep(5)} 
              disabled={formData.energyPeaks.length === 0}
              className="next-btn"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="onboarding-step">
          <h2>What are your goals?</h2>
          
          {loadingGoals ? (
            <div className="loading-goals">
              <div className="spinner"></div>
              <p>Generating personalized goals for you...</p>
            </div>
          ) : (
            <div className="goals-section">
              <h3>Short-term Goals (this week/month)</h3>
              <div className="goal-chips">
                {goalPrompts.short.map(goal => (
                  <div
                    key={goal}
                    className={`goal-chip ${formData.shortTermGoals.includes(goal) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('shortTermGoals', goal)}
                  >
                    {goal}
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: '2rem' }}>Long-term Goals (this year+)</h3>
              <div className="goal-chips">
                {goalPrompts.long.map(goal => (
                  <div
                    key={goal}
                    className={`goal-chip ${formData.longTermGoals.includes(goal) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('longTermGoals', goal)}
                  >
                    {goal}
                  </div>
                ))}
              </div>

              <button 
                onClick={generateGoalPrompts} 
                className="regenerate-goals-btn"
              >
                ↻ Regenerate Goals
              </button>
            </div>
          )}

          <div className="nav-buttons">
            <button onClick={() => setStep(4)} className="back-btn">← Back</button>
            <button 
              onClick={() => setStep(6)} 
              disabled={formData.shortTermGoals.length === 0 && formData.longTermGoals.length === 0}
              className="next-btn"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="onboarding-step">
          <h2>Work & Break Preferences</h2>
          <p className="subtitle">Help us optimize your schedule rhythm</p>

          <div className="form-group">
            <label>Focus Session Length (minutes)</label>
            <p className="helper-text">How long do you typically work before needing a break?</p>
            <div className="slider-container">
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={formData.preferences.focusSessionLength}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, focusSessionLength: e.target.value }
                })}
                className="slider"
              />
              <span className="slider-value">{formData.preferences.focusSessionLength} min</span>
            </div>
          </div>

          <div className="form-group">
            <label>Break Frequency (minutes)</label>
            <p className="helper-text">How often would you like scheduled breaks?</p>
            <div className="slider-container">
              <input
                type="range"
                min="30"
                max="120"
                step="10"
                value={formData.preferences.breakFrequency}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, breakFrequency: e.target.value }
                })}
                className="slider"
              />
              <span className="slider-value">Every {formData.preferences.breakFrequency} min</span>
            </div>
          </div>

          <div className="form-group">
            <label>Preferred Exercise Time (optional)</label>
            <p className="helper-text">When do you like to exercise?</p>
            <select
              value={formData.preferences.exerciseTime}
              onChange={(e) => setFormData({
                ...formData,
                preferences: { ...formData.preferences, exerciseTime: e.target.value }
              })}
              className="select-input"
            >
              <option value="">Skip exercise</option>
              <option value="morning">Morning</option>
              <option value="midday">Midday</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          <div className="nav-buttons">
            <button onClick={() => setStep(5)} className="back-btn">← Back</button>
            <button 
              onClick={() => setStep(7)} 
              className="next-btn"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="onboarding-step">
          <h2>What are you aiming to complete today?</h2>
          
          <div className="todo-input-section">
            <input
              type="text"
              value={currentTodo}
              onChange={(e) => setCurrentTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a task..."
              className="todo-input"
            />
            <button onClick={addTodo} className="add-todo-btn">+ Add</button>
          </div>

          <div className="todo-list">
            {formData.dailyTodos.map(todo => (
              <div key={todo.id} className="todo-item">
                {editingTodoId === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editingTodoText}
                      onChange={(e) => setEditingTodoText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEditTodo();
                        if (e.key === 'Escape') cancelEditTodo();
                      }}
                      className="todo-edit-input"
                      autoFocus
                    />
                    <div className="todo-edit-actions">
                      <button onClick={saveEditTodo} className="save-btn">✓</button>
                      <button onClick={cancelEditTodo} className="cancel-btn">✕</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{todo.text}</span>
                    <div className="todo-actions">
                      <button onClick={() => startEditTodo(todo)} className="edit-btn">✎</button>
                      <button onClick={() => removeTodo(todo.id)} className="remove-btn">×</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {formData.dailyTodos.length === 0 && (
            <div className="empty-state">
              <p>Add your tasks for today and we'll create an optimized schedule</p>
            </div>
          )}

          <div className="nav-buttons">
            <button onClick={() => setStep(6)} className="back-btn">← Back</button>
            <button 
              onClick={generateSmartTimetable} 
              disabled={formData.dailyTodos.length === 0 || isGenerating}
              className="generate-btn"
            >
              {isGenerating ? 'Generating Your Perfect Day...' : 'Generate Smart Timetable'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 

export default Onboarding;