
import React from 'react';
import ReactDOM from 'react-dom/client';

// Simplified App to test component imports one by one
const App: React.FC = () => {
  return (
    <div style={{ color: 'white', padding: '50px', fontSize: '18px' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>PETTYFITNESS 22</h1>
      <p>✅ React is mounting successfully!</p>
      <p>✅ App component is rendering!</p>
      <p style={{ marginTop: '30px', color: '#ff8c37' }}>
        Next step: Add components one by one to find the issue...
      </p>
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
