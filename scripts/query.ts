import { join } from "node:path";
import * as Papa from "papaparse";

interface Table<Item> {
  keys: (keyof Item)[];
  rows: Item[keyof Item][][];
}

const tablify = <Item extends {}>(items: Item[]): Table<Item> => {
  let keys = Object.keys(items[0]) as (keyof Item)[];
  let rows = items.map((item) => keys.map((key) => item[key]));
  return { keys, rows };
};

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

const countsFile = Bun.file(
  join(import.meta.dir, "..", "src", "assets", "counts.json"),
);

interface CountRowKey {
  lang: string;
  year: number;
  quarter: number;
}

interface CountRow extends CountRowKey {
  push5: number;
}

const rowKeyObj = (row: CountRowKey): CountRowKey => {
  return {
    lang: row.lang,
    year: row.year,
    quarter: row.quarter,
  };
};

const rowKey = (row: CountRowKey): string => {
  return JSON.stringify(rowKeyObj(row));
};

const rows = [] as CountRow[];
const dones = new Set<string>();
if (await countsFile.exists()) {
  const table = (await countsFile.json()) as Table<CountRow>;
  for (const row of untablify(table)) {
    rows.push(row);
    dones.add(rowKey(row));
  }
}

interface Lang {
  key: string;
  wikipedia: string;
  reddit: string;
  stackoverflow: string;
}

interface GitHubQueryResponse {
  total_count: number;
}

const quarterEdges = [
  ["01-01", "03-31"],
  ["04-01", "06-30"],
  ["07-01", "09-30"],
  ["10-01", "12-31"],
];

// console.log(import.meta.dir);
const keysFile = Bun.file(join(import.meta.dir, "keys.csv"));
const langsResult = Papa.parse(await keysFile.text(), {
  header: true,
  skipEmptyLines: true,
});
const langs = langsResult.data as any as Lang[];

const requests = function* () {
  for (let year = 2010; year <= 2026; year += 1) {
    for (let quarter = 1; quarter < 5; quarter += 1) {
      for (const lang of langs) {
        const key = lang.key;
        const quarterEdge = quarterEdges[quarter - 1];
        const stars = 5;
        // This is how many repos had at least one push during the quarter.
        const queryParams = {
          language: key,
          pushed: `${year}-${quarterEdge[0]}..${year}-${quarterEdge[1]}`,
          // created: `${year}-${quarterEdge[0]}..${year}-${quarterEdge[1]}`,
          // is: "pr",
          stars: `${stars}..*`,
        };
        const params = {
          q: Object.entries(queryParams)
            .map(([key, value]) => `${key}:${value}`)
            .join(" "),
          per_page: "1",
        };
        const url = new URL("https://api.github.com/search/repositories");
        // const url = new URL("https://api.github.com/search/issues");
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }
        yield {
          langTime: {
            lang: key,
            year,
            quarter,
            stars,
          },
          url,
        };
      }
    }
  }
};

async function fetchWithRateLimit(url: URL) {
  const response = await fetch(url);
  // Get rate limit headers.
  const remaining = Number(response.headers.get("x-ratelimit-remaining"));
  const resetTimestamp = Number(response.headers.get("x-ratelimit-reset"));
  // Space according to limits.
  const now = Math.floor(Date.now());
  const remainingMillis = resetTimestamp * 1000 - now + 500; // add slack
  const delayMillis = remainingMillis / (remaining + 1);
  console.log(delayMillis);
  await Bun.sleep(delayMillis);
  // Then return.
  if (!response.ok) {
    // TODO Handle the "Out of Gas" scenario (Status 403 or 429)?
    console.warn(response.statusText);
    return null;
  }
  return response.json();
}

const saveTable = async () => {
  const table = tablify(rows);
  await Bun.write(countsFile, JSON.stringify(table, undefined, "  "));
  console.log(`Saving at ${rows.length}`);
};

requests: for (const request of requests()) {
  if (dones.has(rowKey(request.langTime))) {
    continue requests;
  }
  // Make request.
  const response = (await fetchWithRateLimit(
    request.url,
  )) as GitHubQueryResponse | null;
  if (!response) {
    continue;
  }
  // Aggregate.
  const row = {
    ...rowKeyObj(request.langTime),
    [`push${request.langTime.stars}`]: response.total_count,
  } as CountRow;
  rows.push(row);
  console.log(row);
  if (rows.length % 10 == 0) {
    await saveTable();
  }
}

await saveTable();
console.log("Finished");
