import { join } from "node:path";
import * as Papa from "papaparse";

const keysFile = Bun.file(join(import.meta.dir, "keys.csv"));
const langsResult = Papa.parse(await keysFile.text(), {
  header: true,
  skipEmptyLines: true,
});

interface Lang {
  key: string;
  wikipedia: string;
  reddit: string;
  stackoverflow: string;
}

const langs = langsResult.data as any as Lang[];
for (const lang of langs) {
  const key = lang.key;
  for (let year = 2010; year <= 2026; year += 1) {
    const url = new URL("https://api.github.com/search/repositories");
    const queryParams = {
      language: key,
      pushed: `${year}-01-01..${year}-12-31`,
      stars: "5..*",
    };
    const params = {
      q: "",
      per_page: "1",
    };
    // url.searchParams.set()
    const query = `
      https://api.github.com/search/repositories?q=language:${key}+pushed:${year}-01-01..${year}-12-31+stars:%3E5&per_page=1
    `.trim();
  }
}
