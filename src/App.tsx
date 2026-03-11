import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Subway } from './pages/Subway';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <SplashScreen onFinish={() => setShowSplash(false)} />
      {!showSplash && (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/subway/:username" element={<Subway />} />
          </Routes>
        </Router>
      )}
    </>
  );
}
