export type TileContent = number | null;

export class Soduko {
  tiles: Uint8Array = new Uint8Array(9 * 9);

  constructor() {}

  static generatePuzzle() {
    const seed = new Soduko();
    // seeding
    for (let i = 0; i < 4; i++) {
      const x = Soduko.randomIndex();
      const y = Soduko.randomIndex();
      const value = Soduko.randomIndex() + 1;
      seed.setTile(x, y, value);
    }
    console.log("solving", seed.toString());
    const solved = seed.solve();
    if (!solved) {
      console.log("seed failed");
      return Soduko.generatePuzzle();
    }
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (Math.random() > 0.6) {
          solved.setTile(x, y, null);
        }
      }
    }
    return solved;
  }

  static randomIndex() {
    return Math.floor(Math.random() * 9);
  }

  isLegal() {
    for (let i = 0; i < 9; i++) {
      if (!this.isContentLegal(this.getColumnContent(i))) return false;
      if (!this.isContentLegal(this.getRowContent(i))) return false;
      if (
        !this.isContentLegal(
          this.getCellContent(...Soduko.getCellCoordsByIndex(i))
        )
      )
        return null;
    }
  }

  isContentLegal(content: TileContent[]) {
    content = content.filter(Boolean);
    return content.length == new Set(content).size;
  }

  solve(): Soduko | false {
    if (this.isComplete()) return this;
    if (!this.isLegal()) return false;

    const missingTiles: {
      x: number;
      y: number;
      possibilities: number[];
    }[] = [];

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.getTile(x, y)) continue;
        const possibilities = this.getPossibleValuesForTile(x, y);
        if (possibilities.length == 0) {
          return false;
        }

        missingTiles.push({
          x,
          y,
          possibilities,
        });
      }
    }

    for (const missing of missingTiles.sort(
      (a, b) => a.possibilities.length - b.possibilities.length
    )) {
      const { x, y, possibilities } = missing;
      for (const possible of possibilities) {
        const s = this.clone();
        s.setTile(x, y, possible);
        const c = s.solve();
        if (c) return c;
      }
    }
    return false;
  }

  static getIndex(x: number, y: number) {
    return x + y * 9;
  }

  allTilesHavePossibleValues() {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.getPossibleValuesForTile(x, y).length == 0) {
          return false;
        }
      }
    }
    return true;
  }

  isComplete() {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.getTile(x, y) === null) {
          return false;
        }
      }
    }
    return true;
  }

  getTile(x: number, y: number) {
    const tile = this.tiles[Soduko.getIndex(x, y)];
    if (tile === 0) {
      return null;
    }
    return tile;
  }

  setTile(x: number, y: number, value: number | null) {
    if (value === null) {
      this.tiles[Soduko.getIndex(x, y)] = 0;
    } else {
      if (value < 1 || value > 9) {
        throw new Error("Invalid value: " + value);
      }
      this.tiles[Soduko.getIndex(x, y)] = value;
    }
  }

  getRowContent(index: number) {
    let row: TileContent[] = [];
    for (let x = 0; x < 9; x++) {
      row.push(this.getTile(x, index));
    }
    return row;
  }

  getColumnContent(index: number) {
    let column: TileContent[] = [];
    for (let y = 0; y < 9; y++) {
      column.push(this.getTile(index, y));
    }
    return column;
  }

  getCellContent(x: number, y: number) {
    x *= 3;
    y *= 3;
    let cell: TileContent[] = [];
    for (let lX = 0; lX < 3; lX++) {
      for (let lY = 0; lY < 3; lY++) {
        cell.push(this.getTile(x + lX, y + lY));
      }
    }
    return cell;
  }

  getAllAffectingContentForTile(x: number, y: number) {
    const row = this.getRowContent(y);
    const column = this.getColumnContent(x);
    const cell = this.getCellContent(...Soduko.getCellCoordsForTile(x, y));

    return [...row, ...column, ...cell];
  }

  getPossibleValuesForTile(x: number, y: number) {
    return Soduko.findMissingNumbers(this.getAllAffectingContentForTile(x, y));
  }

  static findMissingNumbers(numbers: TileContent[]): number[] {
    const foundNumbers = new Array(9).fill(false);
    for (const c of numbers) {
      if (c === null) continue;
      foundNumbers[c - 1] = true;
    }
    const missingNumbers = foundNumbers
      .map((exists, value) => (!exists ? value + 1 : null))
      .filter(Boolean);
    return missingNumbers as number[];
  }

  static getCellCoordsForTile(x: number, y: number) {
    return [Math.floor(x / 3), Math.floor(y / 3)] as [number, number];
  }

  static getCellCoordsByIndex(index: number) {
    return [index % 3, Math.floor(index / 3)] as [number, number];
  }

  clone() {
    const s = new Soduko();
    s.tiles = new Uint8Array(this.tiles);
    return s;
  }

  toString() {
    const horDiv = "  -----------------\n";

    let output = "";
    for (let y = 0; y < 9; y++) {
      if (y % 3 === 0) {
        output += horDiv;
      }
      for (let x = 0; x < 9; x++) {
        if (x % 3 === 0) {
          output += " | ";
        }
        output += this.getTile(x, y) ?? " ";
      }
      output += " |\n";
    }

    output += horDiv;

    return output;
  }
}
