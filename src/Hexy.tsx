import {
  add,
  CompassDirection,
  createHexPrototype,
  Grid as HoneycombGrid,
  Hex,
  neighborOf,
  Point,
} from 'honeycomb-grid';

import { TerrainType } from './const';

export interface Tile {
  /** Unique identifier for this tile, for stable key-ing. */
  id: number;
  terrain: TerrainType[];
}

export interface MyHex extends Hex, Tile {}
export type MyGrid = HoneycombGrid<MyHex>;

const SIZE = 30;
const HEX = createHexPrototype<MyHex>({
  dimensions: SIZE,
  terrain: times(6, () => TerrainType.PLAIN),
});

const DIRECTIONS = [
  CompassDirection.W,
  CompassDirection.NW,
  // CompassDirection.N,
  CompassDirection.NE,
  CompassDirection.E,
  CompassDirection.SE,
  // CompassDirection.S,
  CompassDirection.SW,
];

let nextTileId = 0;

export const Hexy = {
  size: SIZE,
  /** Create new hex grid with some starter tiles. */
  create(x = 10, y = 10): MyGrid {
    return new HoneycombGrid(HEX, add()).update(grid =>
      Hexy.createTiles(2).forEach(tile => {
        // generate a little island of adjacent tiles
        let hex = grid.getHex({ row: 1 + random(x), col: 1 + random(y) }).clone(tile);
        Hexy.set(grid, hex);
        times(3, () => {
          hex = Hexy.neighborsOf(grid, hex)[random(6)].clone(Hexy.tile());
          Hexy.set(grid, hex);
        });
      })
    );
  },
  /** Create a number of new tiles. @default 10 */
  createTiles(count = 10, segments = 3): Tile[] {
    return times<Tile>(count, () => Hexy.tile(segments));
  },
  /** Create a new tile. */
  tile(segments = 3): Tile {
    return {
      id: nextTileId++,
      // falling chance for more segments
      terrain:
        segments <= 1
          ? Array(6).fill(randomTerrain(), 0)
          : times(segments, n => (Math.random() < 1 - (0.8 / segments) * n ? randomTerrain() : null))
              .filter(isDefined)
              .map((type, _i, arr) => times(6 / arr.length, () => type))
              .flat(),
    };
  },
  /** Return screen coordinates of hex center. */
  center(hex: Hex): Point {
    return { x: -hex.center.x + hex.width / 2, y: -hex.center.y + hex.height / 2 };
  },
  /** Get array of all neighbors of this hex. */
  neighborsOf(grid: MyGrid, hex: Hex) {
    return DIRECTIONS.map(d => grid.getHex(neighborOf(hex, d)));
  },
  /**
   * Returns true if touching edges of the two hexes match. `corner` matches
   * `hex.corners` index order.
   */
  edgesMatch(corner: number, a?: MyHex, b?: MyHex) {
    return a?.terrain[corner] === b?.terrain[(corner + 3) % 6];
  },
  /** Convert mouse event to hex coordinates. */
  eventToHex(grid: MyGrid, event: MouseEvent) {
    return grid.pointToHex({ x: event.offsetX, y: event.offsetY });
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
    return hex.corners.map(pt => `${Math.round(pt.x)} ${Math.round(pt.y)}`).join(',');
  },
  /** Rotate an array of terrain types in either direction. */
  rotate(terrain: TerrainType[], times = 1, invert = false): TerrainType[] {
    if (times % terrain.length <= 0) return terrain;
    const direction = invert ? 1 : -1;
    return Hexy.rotate([...terrain.slice(direction), ...terrain.slice(0, direction)], times - 1);
  },
};

function isDefined<T>(x: T | null | undefined): x is T {
  return x != null;
}

function times<R>(n: number, callback: (n: number) => R): R[] {
  return Array(n).fill(null, 0).map(callback);
}

function random(max: number) {
  return Math.floor(Math.random() * max);
}

function randomTerrain(): TerrainType {
  return Math.floor(Math.random() * 4) as TerrainType;
}
