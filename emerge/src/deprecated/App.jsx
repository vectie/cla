import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';

const App = () => {
  return (
    <div className="app">
      <Sidebar />
      <ChatContainer />
    </div>
  );
};

export default App;