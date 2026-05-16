import { createSignal, onMount, Show } from "solid-js";
import solidLogo from "./assets/solid.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
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
  type ChartDataset,
} from "chart.js";
import { percentize, loadCountRows } from "./data";
import colors from "github-colors/colors.json" with { type: "json" };

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
  const rows = percentize(loadCountRows());
  const langs = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C#",
    "C++",
    "Go",
    "Rust",
    "C",
    "PHP",
  ];
  // Any language is good enough for labels.
  const py = rows.filter((row) => row.lang == "Python");
  const charData = () => ({
    labels: py.map((row) => `${row.year}Q${row.quarter}`),
    datasets: langs.map((lang): ChartDataset => {
      // TODO Better default colors.
      const color = colors[lang as keyof typeof colors].color ?? "white";
      return {
        label: lang,
        data: rows.filter((row) => row.lang == lang).map((row) => row.push5),
        borderColor: color,
        backgroundColor: color,
        tension: 0.2,
      }
    })
  });
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div id="chart-container">
      <Show when={isReady()}>
        <Line data={charData()} options={chartOptions} />
      </Show>
    </div>
  );
};

function App() {
  const [count, setCount] = createSignal(0);
  return (
    <div id="app">
      <MyChart />
      <section style={{ display: "none" }}>
        <button class="counter" onClick={() => setCount((count) => count + 1)}>
          Count is {count()}
        </button>
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
          {/* <p>
            {JSON.stringify(counts.keys)} with {counts.rows.length} rows
          </p> */}
        </div>
      </section>
    </div>
  );
}

export default App;
