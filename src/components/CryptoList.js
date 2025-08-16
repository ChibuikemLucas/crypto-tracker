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
        <div className="crypto-list" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'center',
        }}>
            {cryptos.map((coin) => {
                const up = coin.price_change_percentage_24h >= 0;
                return (
                    <div key={coin.id} className="crypto-card" style={{
                        minWidth: 220,
                        maxWidth: 260,
                        flex: '1 1 220px',
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: 18,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 8,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={coin.image} alt={coin.symbol} style={{ width: 32, height: 32, borderRadius: 8, background: '#222' }} />
                            <div className="coin-name">
                                <span style={{ fontWeight: 600 }}>{coin.name}</span>
                                <span className="symbol">{coin.symbol.toUpperCase()}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 18, fontWeight: 500 }}>
                            ${coin.current_price.toLocaleString()}
                        </div>
                        <div className={up ? "up" : "down"} style={{ fontSize: 15 }}>
                            {up ? "▲" : "▼"} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default CryptoList;
