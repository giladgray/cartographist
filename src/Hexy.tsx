import { add, CompassDirection, createHexPrototype, Grid as HoneycombGrid, Hex, neighborOf } from 'honeycomb-grid';

export enum TerrainType {
  PLAIN,
  FOREST,
  MOUNTAIN,
  WATER,
}

export interface Tile {
  /** Unique identifier for this tile, for stable key-ing. */
  id: number;
  /** Terrain type of tile. */
  type: TerrainType;
}

export interface MyHex extends Hex, Tile {}
export type MyGrid = HoneycombGrid<MyHex>;

const SIZE = 30;
const HEX = createHexPrototype<MyHex>({ dimensions: SIZE, type: TerrainType.PLAIN });

const DIRECTIONS = [
  // CompassDirection.N,
  CompassDirection.NE,
  CompassDirection.E,
  CompassDirection.SE,
  // CompassDirection.S,
  CompassDirection.SW,
  CompassDirection.W,
  CompassDirection.NW,
];

let nextTileId = 0;

export const Hexy = {
  size: SIZE,
  /** Create new hex grid with some starter tiles. */
  create(x = 5, y = 6): MyGrid {
    return new HoneycombGrid(HEX, add([x, y], [x - 1, y], [x, y - 1]));
  },
  /** Create a number of new tiles. */
  createTiles(count = 10): Tile[] {
    return Array(count)
      .fill(TerrainType.PLAIN, 0)
      .map(() => ({ id: nextTileId++, type: Math.floor(Math.random() * 4) as TerrainType }));
  },
  /** Get array of all neighbors of this hex. */
  neighborsOf(grid: MyGrid, hex: Hex) {
    return DIRECTIONS.map(d => grid.getHex(neighborOf(hex, d)));
  },
  /** Test if `grid.store` or map contains this hex. */
  has(grid: MyGrid | Map<string, MyHex>, hex: Hex) {
    return ('store' in grid ? grid.store : grid).has(hex.toString());
  },
  /** Get hex in `grid.store` or map. */
  get(grid: MyGrid | Map<string, MyHex>, hex: MyHex) {
    return ('store' in grid ? grid.store : grid).get(hex.toString());
  },
  /** Set hex in `grid.store` or map. */
  set(grid: MyGrid | Map<string, MyHex>, hex: MyHex) {
    ('store' in grid ? grid.store : grid).set(hex.toString(), hex);
  },
  /** Get an id string for this hex with optional suffix. */
  id(hex: MyHex, suffix = '') {
    return [hex.q, hex.r, suffix].join('-');
  },
  /** Get SVG `<polygon points={..}>` string for this hex. */
  points(hex: Hex): string {
    return hex.corners.map(c => `${Math.round(c.x)} ${Math.round(c.y)}`).join(',');
  },
};
