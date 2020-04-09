import React, { useState, useEffect } from 'react';
import './App.css';
import SwipeContainer from './Swiper'
import MobileDetect from 'mobile-detect';

const styleDiv = {
  padding: "16px",
  margin: "8px",
  borderRadius: "6px",
  backgroundColor: "#60a3bc",
  color: "white",
};

function App() {
  const items = ["#AD91FF", "#9EBAFF", "#91EAFF", "#FF9B91", "#9EBAFF", "#86FF3C"];
  let isMobile =
    new MobileDetect(window.navigator.userAgent).mobile() != null;
  const [viewMode, setViewMode] = useState('mobile')

  useEffect(() => {
    const handleResize = e => {

      if (document.documentElement.clientWidth < 600) {
        setViewMode('mobile')
      } else {
        setViewMode('desktop')
      }
    };
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize) }
  }, [])


  const getContent = () => {
    if (viewMode !== 'mobile') {
      return <SwipeContainer>
        {items.splice(0, 3).map((item, index) => (
          <div key={item} style={{ ...styleDiv, backgroundColor: item }}>
            {item}
          </div>
        ))}
      </SwipeContainer>
    } else {
      return <SwipeContainer>
        {items.map((item, index) => (
          <div key={item} style={{ ...styleDiv, backgroundColor: item }}>
            {item}
          </div>
        ))}
      </SwipeContainer>

    }
  }

  return (
    <div className="App">
      <div style={{ width: '40%' }}>
        {getContent()}
      </div>
    </div>
  );
}

export default App;