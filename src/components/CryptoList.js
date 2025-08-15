import React, { useEffect, useState } from "react";
import axios from "axios";

function CryptoList() {
    const [cryptos, setCryptos] = useState([]);

    useEffect(() => {
        // Placeholder for API call
        // Tomorrow we'll fetch from CoinGecko
        setCryptos([
            { id: 1, name: "Bitcoin", symbol: "BTC", price: 50000 },
            { id: 2, name: "Ethereum", symbol: "ETH", price: 4000 },
        ]);
    }, []);

    return (
        <div className="crypto-list">
            {cryptos.map((coin) => (
                <div key={coin.id} className="crypto-card">
                    <h3>{coin.name} ({coin.symbol})</h3>
                    <p>${coin.price.toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
}

export default CryptoList;
