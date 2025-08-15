//import React from "react";
import CryptoList from "./components/CryptoList";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header>
        <h1>💹 Crypto Tracker</h1>
        <p>Real-time prices & interactive charts</p>
      </header>
      <CryptoList />
    </div>
  );
}

export default App;
