import { add, CompassDirection, createHexPrototype, Grid, Hex, neighborOf } from 'honeycomb-grid';
import React, { useMemo, useState } from 'react';

enum TerrainType {
  PLAIN,
  FOREST,
  MOUNTAIN,
  WATER,
}

const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.PLAIN]: 'wheat',
  [TerrainType.FOREST]: 'darkgreen',
  [TerrainType.MOUNTAIN]: 'darkgray',
  [TerrainType.WATER]: 'cornflowerblue',
};

interface MyHex extends Hex {
  type: TerrainType;
}

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

const Hexy = {
  /** Create new hex grid with some starter tiles. */
  create() {
    return new Grid(HEX, add([3, 5], [2, 5], [3, 4]));
  },
  /** Get array of all neighbors of this hex. */
  neighborsOf(grid: Grid<MyHex>, hex: Hex) {
    return DIRECTIONS.map(d => grid.getHex(neighborOf(hex, d)));
  },
  /** Test if `grid.store` contains this hex. */
  has(grid: Grid<MyHex>, hex: Hex) {
    return grid.store.has(hex.toString());
  },
  /** Get SVG `<polygon points={..}>` string for this hex. */
  points(hex: Hex): string {
    return hex.corners.map(c => `${c.x} ${c.y}`).join(',');
  },
};

/** Create a number of new tiles. */
function createTiles(count = 10) {
  return Array(count)
    .fill(TerrainType.PLAIN, 0)
    .map(() => Math.floor(Math.random() * 4) as TerrainType);
}

export const HexGrid: React.FC = () => {
  const [grid, setGrid] = useState(Hexy.create);
  const [stack, setStack] = useState(createTiles);

  // get all hexes from grid.store
  const hexes: MyHex[] = [];
  grid.run(hex => hexes.push(hex));

  // get all unique neighbors of hexes
  const neighbors = new Map<string, MyHex>();
  grid.run(hex => {
    for (const n of Hexy.neighborsOf(grid, hex)) {
      if (!Hexy.has(grid, n)) {
        neighbors.set(n.toString(), n);
      }
    }
  });

  const handleClick: React.MouseEventHandler = ({ nativeEvent: { offsetX, offsetY } }) => {
    const pt = grid.pointToHex({ x: offsetX, y: offsetY });
    // can place in empty tile next to a placed tile
    if (stack.length > 0 && !Hexy.has(grid, pt) && neighbors.has(pt.toString())) {
      const [head, ...rest] = stack;
      pt.type = head;
      setStack(rest);
      setGrid(
        grid.update(g => {
          g.store.set(pt.toString(), pt);
        })
      );
    }
  };

  const width = 500;
  const height = 500;

  return (
    <div className="App">
      <header>
        <button onClick={() => setGrid(Hexy.create())}>New game</button>
      </header>

      <svg className="cartograph" width={width} height={height} onClick={handleClick}>
        <rect width="100%" height="100%" fill="lightblue" fillOpacity={0.3} />

        {hexes.map((hex, i) => (
          <polygon key={`tile-${i}`} points={Hexy.points(hex)} fill={TERRAIN_COLORS[hex.type]} />
        ))}
        {stack.length > 0 &&
          Array.from(neighbors.values()).map((hex, i) => (
            <polygon key={`empty-${i}`} points={Hexy.points(hex)} className="open" stroke="lightblue" fill="snow" />
          ))}
      </svg>
      <svg width={SIZE * 2} height={height}>
        {stack
          .map((t, i) => (
            <g key={`stack-${i}`} transform={`translate(${SIZE}, ${height - SIZE / 3 - (stack.length - i) * 10})`}>
              <polygon points={Hexy.points(stackTile)} stroke="white" strokeWidth={3} fill={TERRAIN_COLORS[t]} />
            </g>
          ))
          .reverse()}
        <g transform={`translate(${SIZE}, ${height - SIZE / 3})`}>
          <rect fill="white" rx={6} x={-12} y={-15} width={24} height={20} />
          <text textAnchor="middle">{stack.length}</text>
        </g>
      </svg>
    </div>
  );
};

/*
ROADMAP
- rules about placing
  x must have 1+ neighbor
- several terrain types
  x plain
  x forest
  x mountain
  x water
  - desert?
  - tundra?
  - swamp?
x stack of incoming tiles
- draw percentage of terrain types
- each tile edge has terrain type
- rotate incoming tiles
- scoring
  - detect contiguous regions
- quests
  - contiguous region multiplier
  - earning points gives you more tiles in stack
  - place banner to earn points

ADVANCED
- rivers
  - edge with river can only connect to river or water edge
  - non-water cannot connect to river
- landmark tiles
- naming
  - name landmarks
  - name regions of significant size
  - fantasy name generator
  - Banners as placeable tile modifiers
    - earn banners through gameplay
    - placing banner earns score and "completes" the region
- roads


*/
