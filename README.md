# 🚇 GitSubway | 3D GitHub Metro Visualization ⚡

![GitSubway Banner](https://img.shields.io/badge/GitSubway-3D_Viz-blue?style=for-the-badge&logo=github&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.dot.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

**GitSubway** is a cinematic 3D experiment that reimagines your GitHub journey as an expansive, interconnected metro system. Every repository becomes a station, every language a line, and every commit a pulse in the transit network.

---

## 🌟 Visionary Features

- **🌐 3D Metro Mapping**: Procedurally generated railway network based on repository metadata.
- **🌡️ Environmental Seasons**: Real-time toggles for Summer, Autumn, Winter, and Blossom modes with dynamic particle effects.
- **🤺 Subway Battle**: Compare repositories in a high-octane 3D arena.
- **🕒 Time-Travel**: Toggle between day and night cycles affecting lighting and station activity.
- **🛰️ AI Insights**: Generates a "Transit Report" of your coding career using Google Gemini.

---

## 📂 Project Structure

```text
GitSubway/
├── src/
│   ├── components/
│   │   ├── MetroScene/    # Core Three.js Canvas & Animation
│   │   ├── UI/            # Shaders & Ambient backdrops
│   │   └── Panels/        # Analytics & AI Insight overlays
│   ├── pages/
│   │   ├── Home.tsx       # Landing & Username entry
│   │   └── Subway.tsx     # The 3D Visualization environment
│   ├── utils/
│   │   └── visualMapping/ # Algorithmic graph-to-metro logic
│   └── types.ts           # Strict TS metadata
├── public/                # 3D Assets & Textures
└── package.json
```

---

## 🚀 Getting Started

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your Gemini API Key in `.env.local`:
   ```env
   VITE_GEMINI_API_KEY=your_api_key
   ```

3. Start the engine:
   ```bash
   npm run dev
   ```

---

## 🧠 Technical Architecture

- **Spatial Graph Logic**: repository nodes are intelligently spaced using a custom repulsion algorithm to avoid station overlap while maintaining timeline flow.
- **Post-Processing**: Uses Bloom and God-ray passes to achieve a futuristic "Cyberpunk" aesthetic.
- **HMR Shaders**: Dynamic skyboxes and ground textures that update without page refreshes.

---

## 📄 License
MIT © 2026 GitSubway Team
