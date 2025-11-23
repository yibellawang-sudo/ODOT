# ODOT

A personal life helper that tracks your screen time, organizes your tasks, and roasts you for doomscrolling.

## Features

### Screen Time Tracking
- Monitors browsing activity in real-time
- Categorizes sites as Work vs Play
- Provides iOS-style screen time insights
- Roasts you for spending too long on social media

### Task Organizer
- Input tasks with due dates and estimated time
- Break down large tasks into smaller ones
- Prioritizes based on importance and deadlines
- Congratulates you for completing tasks

### Goals & Priorities
- Set long-term and short-term goals
- Daily priority tracking
- Analyzes if your browsing aligns with your goals
- Detects doomscrolling and distractions

### Wellness Features (Coming Soon)
- Food consumption tracking
- Health evaluation
- Diet suggestions & meal plans
- Timetable that prioritizes personal wellbeing

## Tech Stack

| Component | Purpose |
|-----------|---------|
| **Chrome Extension** | Monitors browsing, detects doomscrolling |
| **Electron App** | Desktop dashboard, task organizer |
| **React** | UI components |
| **Native Messaging** | Chrome ↔ Electron communication |

## Project Structure

```
odot/
├── src/
│   ├── electron.js           # Electron main process
│   ├── preload.js            # Electron preload script
│   ├── App.js                # React app entry
│   └── components/
│       ├── StartScreen.js    # Welcome screen
│       ├── Onboarding.js     # Feature selection
│       ├── WorkflowScreen.js # Route handler
│       └── Dashboard.js      # Screen time display
├── chrome-extension/
│   ├── manifest.json         # Extension config
│   ├── background.js         # Tracking logic
│   ├── popup.html            # Extension popup
│   └── popup.js              # Popup UI
├── nativeHost.js             # Native messaging bridge
└── package.json
```

## App Flow

```
1. Welcome Screen
   └── "ODOT"

2. Onboarding: Pick a Workflow
   ├── Screentime Usage
   ├── Notes & Goals
   └── Todos

3. Dashboard (per workflow)
   ├── Stats
   ├── Analysis
   └── Settings
```

## Setup

### 1. Install Dependencies

```bash
cd odot
npm install
```

### 2. Install Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. Copy the **Extension ID**

### 3. Run the App

You need **3 terminals** running:

**Terminal 1 — Start the data server:**
```bash
node server.js
```
You should see: `Server running at http://localhost:3737/`

**Terminal 2 — Start React:**
```bash
npm run react-start
```

**Terminal 3 — Start Electron:**
```bash
npm start
```

## Usage

1. **Download** the code from GitHub
2. **Open** the app and complete onboarding
3. **Pick** a workflow (screentime, notes, or todos)
4. **Browse** the web normally
5. **Check** your stats, analysis, and get roasted

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| ![#BEEF9E](https://via.placeholder.com/15/BEEF9E/BEEF9E.png) | `#BEEF9E` | Accent light |
| ![#A6C36F](https://via.placeholder.com/15/A6C36F/A6C36F.png) | `#A6C36F` | Primary green |
| ![#828C51](https://via.placeholder.com/15/828C51/828C51.png) | `#828C51` | Secondary |
| ![#335145](https://via.placeholder.com/15/335145/335145.png) | `#335145` | Dark accent |
| ![#1E352F](https://via.placeholder.com/15/1E352F/1E352F.png) | `#1E352F` | Background dark |

## Environment Variables

Create a `.env` file:

```
API_KEY=your_api_key_here
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Electron app |
| `npm run react-start` | Start React dev server |
| `npm run build` | Build for production |

## Roadmap

- [x] Chrome extension tracking
- [x] Screen time dashboard
- [x] Work vs Play analysis
- [ ] Task organizer
- [ ] Notes & goals
- [ ] Doomscroll detection & roasting
- [ ] Health tracking
- [ ] Meal planning

## License

MIT

---

Built at [Hack Club](https://hackclub.com) Parthenon!
