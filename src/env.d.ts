declare module "@counts" {
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

  const value: Table<CountRow>;
  export default value;
}
