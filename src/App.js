import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [selectedCoin, setSelectedCoin] = useState("bitcoin"); // chart coin
  const [chartData, setChartData] = useState(null);

  const intervalRef = useRef(null);

  async function fetchCoins({ background = false } = {}) {
    try {
      if (background) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets" +
        "?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
      );

      if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

      const data = await res.json();
      setCoins(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchChart(coinId = "bitcoin") {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`
      );
      if (!res.ok) throw new Error(`Chart fetch failed: ${res.status}`);
      const data = await res.json();

      const labels = data.prices.map((p) =>
        new Date(p[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );
      const prices = data.prices.map((p) => p[1]);

      // Decide chart color based on trend (last - first)
      const trendUp = prices[prices.length - 1] >= prices[0];
      const borderColor = trendUp ? "rgb(34,197,94)" : "rgb(239,68,68)"; // tailwind green/red
      const backgroundColor = trendUp
        ? "rgba(34,197,94,0.2)"
        : "rgba(239,68,68,0.2)";

      setChartData({
        labels,
        datasets: [
          {
            label: `${coinId} price (7d)`,
            data: prices,
            borderColor,
            backgroundColor,
            fill: true,
            tension: 0.25,
          },
        ],
      });
    } catch (e) {
      console.error("Chart error", e);
      setChartData(null);
    }
  }

  useEffect(() => {
    fetchCoins({ background: false });
    fetchChart(selectedCoin);

    intervalRef.current = setInterval(() => {
      fetchCoins({ background: true });
      fetchChart(selectedCoin);
    }, 60_000);

    return () => clearInterval(intervalRef.current);
  }, [selectedCoin]);

  if (loading) {
    return (
      <div className="page">
        <h1>Crypto Tracker 💹</h1>
        <div className="spinner" aria-label="Loading" />
        <p className="muted">Loading crypto prices…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>Crypto Tracker 💹</h1>
        <p className="error">Error: {error}</p>
        <button className="btn" onClick={() => fetchCoins({ background: false })}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Crypto Tracker 💹</h1>
        <div className="statusbar">
          <span className="pill">{refreshing ? "Refreshing…" : "Live"}</span>
          {lastUpdated && (
            <span className="muted">
              Last updated:{" "}
              {new Date(lastUpdated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
          <button
            className="btn ghost"
            onClick={() => fetchCoins({ background: true })}
            disabled={refreshing}
            title="Refresh now"
          >
            ↻
          </button>
        </div>
      </header>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 64 }}>#</th>
              <th>Coin</th>
              <th>Price</th>
              <th>24h</th>
              <th>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => {
              const up = coin.price_change_percentage_24h >= 0;
              return (
                <tr key={coin.id}>
                  <td>{coin.market_cap_rank}</td>
                  <td className="coin">
                    <img src={coin.image} alt={coin.name} width="22" height="22" />
                    <div className="coin-name">
                      <strong>{coin.name}</strong>
                      <span className="symbol">{coin.symbol.toUpperCase()}</span>
                    </div>
                  </td>
                  <td>${coin.current_price.toLocaleString()}</td>
                  <td className={up ? "up" : "down"}>
                    {up ? "▲" : "▼"}{" "}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </td>
                  <td>${coin.market_cap.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <div className="chart-header">
          <label>
            Select Coin:{" "}
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="dogecoin">Dogecoin (DOGE)</option>
              <option value="binancecoin">BNB (BNB)</option>
              <option value="ripple">XRP (XRP)</option>
              <option value="cardano">Cardano (ADA)</option>
              <option value="solana">Solana (SOL)</option>
              <option value="polkadot">Polkadot (DOT)</option>
              <option value="tron">TRON (TRX)</option>
              <option value="litecoin">Litecoin (LTC)</option>
            </select>
          </label>
        </div>
        {chartData ? (
          <Line data={chartData} />
        ) : (
          <p className="muted">Loading chart…</p>
        )}
      </div>

      <p className="muted tiny">
        Data: CoinGecko — refreshed every 60 seconds on the client.
      </p>
    </div>
  );
}
