import { join } from "node:path";
import * as Papa from "papaparse";

const keysFile = Bun.file(join(import.meta.dir, "keys.csv"));
const langsResult = Papa.parse(await keysFile.text(), {
  header: true,
  skipEmptyLines: true,
});
const langs = langsResult.data as any as Lang[];

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

const requests = function* () {
  for (let year = 2010; year <= 2026; year += 1) {
    for (let quarter = 1; quarter < 5; quarter += 1) {
      for (const lang of langs) {
        const key = lang.key;
        const quarterEdge = quarterEdges[quarter - 1];
        const queryParams = {
          language: key,
          pushed: `${year}-${quarterEdge[0]}..${year}-${quarterEdge[1]}`,
          stars: "5..*",
        };
        const params = {
          q: Object.entries(queryParams)
            .map(([key, value]) => `${key}:${value}`)
            .join(" "),
          per_page: "1",
        };
        const url = new URL("https://api.github.com/search/repositories");
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }
        yield {
          langTime: {
            lang: key,
            year,
            quarter,
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

let done = 0;
for (const request of requests()) {
  const response = (await fetchWithRateLimit(
    request.url,
  )) as GitHubQueryResponse | null;
  if (!response) {
    continue;
  }
  const entry = { ...request.langTime, count: response.total_count };
  console.log(entry);
  done += 1;
  if (done > 3) {
    break;
  }
}
