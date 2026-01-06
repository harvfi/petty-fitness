
import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal test to verify React mounting works
const App = () => {
  return (
    <div style={{ color: 'white', padding: '50px', fontSize: '24px' }}>
      <h1>PETTYFITNESS 22 - TEST</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
