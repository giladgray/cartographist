import { add, CompassDirection, createHexPrototype, Grid, Hex, neighborOf } from 'honeycomb-grid';
import React, { useEffect, useMemo, useState } from 'react';

enum TerrainType {
  PLAIN,
  FOREST,
  MOUNTAIN,
  WATER,
}

const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.PLAIN]: 'wheat',
  [TerrainType.FOREST]: 'darkgreen',
  [TerrainType.MOUNTAIN]: 'dimgray',
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
  create(x = 5, y = 6) {
    return new Grid(HEX, add([x, y], [x - 1, y], [x, y - 1]));
  },
  /** Get array of all neighbors of this hex. */
  neighborsOf(grid: Grid<MyHex>, hex: Hex) {
    return DIRECTIONS.map(d => grid.getHex(neighborOf(hex, d)));
  },
  /** Test if `grid.store` or map contains this hex. */
  has(grid: Grid<MyHex> | Map<string, MyHex>, hex: Hex) {
    return ('store' in grid ? grid.store : grid).has(hex.toString());
  },
  /** Get hex in `grid.store` or map. */
  get(grid: Grid<MyHex> | Map<string, MyHex>, hex: MyHex) {
    return ('store' in grid ? grid.store : grid).get(hex.toString());
  },
  /** Set hex in `grid.store` or map. */
  set(grid: Grid<MyHex> | Map<string, MyHex>, hex: MyHex) {
    ('store' in grid ? grid.store : grid).set(hex.toString(), hex);
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
  // total score
  const [score, setScore] = useState(0);
  // points earned from last move
  const [points, setPoints] = useState(0);
  // score from the previous target
  const [lastScore, setLastScore] = useState(0);
  // points needed to reach next target (lastScore + target)
  const [target, setTarget] = useState(10);

  // award more tiles for reaching the target and set a new larger target.
  useEffect(() => {
    if (score - lastScore >= target) {
      setStack(s => s.concat(createTiles(5)));
      setLastScore(lastScore + target);
      setTarget(Math.floor(target * 1.2));
    }
  }, [score, lastScore, target]);

  // get all hexes from grid.store
  const hexes: MyHex[] = [];
  grid.run(hex => hexes.push(hex));

  // get all unique neighbors of hexes
  const neighbors = new Map<string, MyHex>();
  grid.run(hex => {
    for (const n of Hexy.neighborsOf(grid, hex)) {
      if (!Hexy.has(grid, n)) {
        Hexy.set(neighbors, n);
      }
    }
  });

  const handleClick: React.MouseEventHandler = ({ nativeEvent: { offsetX, offsetY } }) => {
    const pt = grid.pointToHex({ x: offsetX, y: offsetY });
    // can place in empty tile next to a placed tile
    if (stack.length > 0 && !Hexy.has(grid, pt) && Hexy.has(neighbors, pt)) {
      const [head, ...rest] = stack;
      pt.type = head;
      setStack(rest);
      setGrid(grid.update(g => Hexy.set(g, pt)));

      // award points for adding a tile
      const neighbors = Hexy.neighborsOf(grid, pt).filter(n => Hexy.get(grid, n)?.type === pt.type);
      const points = 1 + neighbors.length ** 2;
      setPoints(points);
      setScore(s => s + points);
    }
  };

  const newGame = () => {
    setPoints(0);
    setScore(0);
    setLastScore(0);
    setTarget(10);
    setGrid(Hexy.create());
    setStack(createTiles());
  };

  const width = 800;
  const height = 600;
  const stackTile = grid.getHex({ col: 0, row: 0 });
  return (
    <div className="App">
      <header>
        <h1>Cartographer's Guild</h1>
        <button onClick={newGame}>New game</button>
        <button disabled={stack.length > 40} onClick={() => setStack(s => s.concat(createTiles(5)))}>
          Add 5
        </button>
      </header>

      {/* default fill for hover state on perimeter */}
      <svg className="cartograph" width={width} height={height} onClick={handleClick} fill={TERRAIN_COLORS[stack[0]]}>
        <rect width="100%" height="100%" fill="linen" fillOpacity={0.7} />

        {hexes.map((hex, i) => (
          <polygon key={`tile-${i}`} points={Hexy.points(hex)} fill={TERRAIN_COLORS[hex.type]} />
        ))}
        {stack.length > 0 &&
          Array.from(neighbors.values()).map((hex, i) => (
            <polygon
              key={`empty-${i}`}
              points={Hexy.points(hex)}
              className="open"
              fill="lightsteelblue"
              fillOpacity={0.2}
            />
          ))}

        <g className="score">
          <text x={width / 2} y={height - SIZE} fontSize="2em" textAnchor="middle">
            {score}
          </text>
          {points > 0 && (
            <text x={width / 2} y={height - 10} textAnchor="middle">
              +{points}
            </text>
          )}
          <text x={width - 10} y={height - 10} fillOpacity={0.5} textAnchor="end">
            {lastScore + target}
          </text>
          <rect x={0} y={height - 5} width={width * ((score - lastScore) / target)} height={5} fill="maroon" />
        </g>
      </svg>
      <svg className="storage" width={SIZE * 2} height={height}>
        {stack
          .map((t, i) => (
            <g key={`stack-${i}`} transform={`translate(${SIZE}, ${height - 5 - (stack.length - i) * 10})`}>
              <polygon points={Hexy.points(stackTile)} stroke="white" strokeWidth={2} fill={TERRAIN_COLORS[t]} />
            </g>
          ))
          // so the first one is one top
          .reverse()}

        <g transform={`translate(${SIZE}, ${height - SIZE / 3})`}>
          <rect fill="white" rx={6} x={-12} y={-15} width={24} height={20} />
          <text fill={stack.length > 2 ? 'inherit' : 'red'} textAnchor="middle">
            {stack.length || 'END'}
          </text>
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
x basic scoring
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
