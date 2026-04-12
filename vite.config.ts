import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solid(),
    {
      name: "data",
      resolveId(id) {
        if (id == "@counts") {
          return id;
        }
      },
      load(id) {
        if (id == "@counts") {
          const filePath = path.resolve(__dirname, "scripts/counts.json");
          const fileContent = readFileSync(filePath, "utf-8");
          const counts = JSON.parse(fileContent) as Table<CountRow>;
          // For the counts used in the app, strip zeros for a smaller file.
          counts.rows = counts.rows.filter((row) => row.at(-1) != 0);
          return `export default ${JSON.stringify(counts)}`;
        }
      },
    },
  ],
});

export interface Table<Item> {
  keys: (keyof Item)[];
  rows: Item[keyof Item][][];
}

export interface CountRowKey {
  lang: string;
  year: number;
  quarter: number;
}

export interface CountRow extends CountRowKey {
  push5: number;
}
