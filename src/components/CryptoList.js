import /*React,*/ { useEffect, useState } from "react";
import axios from "axios";

function CryptoList() {
    const [cryptos, setCryptos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(
                    "https://api.coingecko.com/api/v3/coins/markets",
                    {
                        params: {
                            vs_currency: "usd",
                            order: "market_cap_desc",
                            per_page: 5,
                            page: 1,
                            sparkline: false,
                        },
                    }
                );
                setCryptos(res.data);
            } catch (err) {
                setError("Failed to load crypto data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <p>Loading cryptos…</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="crypto-list">
            {cryptos.map((coin) => {
                const up = coin.price_change_percentage_24h >= 0;
                return (
                    <div key={coin.id} className="crypto-card">
                        <h3>
                            {coin.name} ({coin.symbol.toUpperCase()})
                        </h3>
                        <p>${coin.current_price.toLocaleString()}</p>
                        <p className={up ? "up" : "down"}>
                            {up ? "▲" : "▼"}{" "}
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

export default CryptoList;
