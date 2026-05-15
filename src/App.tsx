import { createSignal, onMount, Show } from "solid-js";
import solidLogo from "./assets/solid.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import counts from "@counts";
import type { Table } from "@counts";
import { Line } from "solid-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
} from "chart.js";

const untablify = <Item extends {}>(table: Table<Item>): Item[] => {
  const { keys, rows } = table;
  return rows.map((row) => {
    // Reduce the row array back into an object
    return row.reduce((acc, value, index) => {
      const key = keys[index];
      acc[key] = value;
      return acc;
    }, {} as Item);
  });
};

// window.onload = () => {
//   // This forces the browser to re-evaluate the layout and paint tree
//   window.dispatchEvent(new Event("resize"));
//   // Or, "wiggle" the mouse programmatically over the body
//   document.body.dispatchEvent(
//     new MouseEvent("mousemove", {
//       view: window,
//       bubbles: true,
//       cancelable: true,
//     }),
//   );
// };

const MyChart = () => {
  const [isReady, setIsReady] = createSignal(false);
  // Register Chart.js modules on mount
  onMount(() => {
    ChartJS.register(
      Title,
      Tooltip,
      Legend,
      LineElement,
      LinearScale,
      CategoryScale,
      PointElement,
    );
    setIsReady(true);
  });
  // Data processing logic
  const rows = untablify(counts);
  const py = rows.filter((row) => row.lang == "Python");
  // Chart.js requires labels for the X-axis (e.g., "2026Q1") instead of raw index arrays
  const labels = py.map((row) => `${row.year}Q${row.quarter}`);
  const pyCounts = py.map((row) => row.push5);
  const jsCounts = rows
    .filter((row) => row.lang == "JavaScript")
    .map((row) => row.push5);
  const tsCounts = rows
    .filter((row) => row.lang == "TypeScript")
    .map((row) => row.push5);
  // Format data specifically for Chart.js structure
  const chartData = () => ({
    labels: labels,
    datasets: [
      {
        label: "Python",
        data: pyCounts,
        borderColor: "#1f77b4",
        backgroundColor: "#1f77b4",
        tension: 0.1, // Smooth lines slightly if desired
      },
      {
        label: "JavaScript",
        data: jsCounts,
        borderColor: "#ff7f0e",
        backgroundColor: "#ff7f0e",
        tension: 0.1,
      },
      {
        label: "TypeScript",
        data: tsCounts,
        borderColor: "#40af0e",
        backgroundColor: "#40af0e",
        tension: 0.1,
      },
    ],
  });
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div id="chart-container" style={{ width: "600px", height: "400px" }}>
      <Show when={isReady()}>
        <Line data={chartData()} options={chartOptions} />
      </Show>
    </div>
  );
};

function App() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <section id="center">
        <div class="hero">
          <img src={heroImg} class="base" width="170" height="179" alt="" />
          <img src={solidLogo} class="framework" alt="Solid logo" />
          <img src={viteLogo} class="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
          <p>
            {JSON.stringify(counts.keys)} with {counts.rows.length} rows
          </p>
        </div>
        <div>
          <MyChart />
        </div>
        <button class="counter" onClick={() => setCount((count) => count + 1)}>
          Count is {count()}
        </button>
      </section>

      <div class="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg class="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img class="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://solidjs.com/" target="_blank">
                <img class="button-icon" src={solidLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg class="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg class="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg class="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg class="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg class="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div class="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
