import counts from "@counts";
import type { Table } from "@counts";

export const loadCountRows = () => {
  const rows = untablify(counts);
  // Find min date.
  let minYear = Number.MAX_SAFE_INTEGER;
  for (const row of rows) {
    minYear = Math.min(row.year, minYear);
  }
  // Fill in zeros for all missing rows.
  const outRows = [];
  let nextYear = 0;
  let nextQuarter = 0;
  const incQuarter = () => {
    nextQuarter += 1;
    if (nextQuarter > 4) {
      nextYear += 1;
      nextQuarter = 1;
    }
  };
  let lastLang = "";
  for (const row of rows) {
    if (row.lang != lastLang) {
      nextYear = minYear;
      nextQuarter = 1;
      lastLang = row.lang;
    }
    while (nextYear < row.year || nextQuarter < row.quarter) {
      outRows.push({
        lang: row.lang,
        year: nextYear,
        quarter: nextQuarter,
        push5: 0
      });
      incQuarter();
    }
    outRows.push(row);
    // If we met the previous quarter, then inc should get us to the next.
    incQuarter();
  }
  return outRows;
}

export const untablify = <Item extends {}>(table: Table<Item>): Item[] => {
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
