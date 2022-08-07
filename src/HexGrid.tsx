import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { Hexy, MyGrid, MyHex, TerrainType, Tile } from './Hexy';

const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.PLAIN]: '#E1C16E',
  [TerrainType.FOREST]: '#228B22', // forestgreen
  [TerrainType.MOUNTAIN]: '#696969', // dimgray
  [TerrainType.WATER]: '#0096FF',
};

export const HexGrid: React.FC = () => {
  const [grid, setGrid] = useState(Hexy.create);
  const [stack, setStack] = useState(Hexy.createTiles);
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
      setStack(s => s.concat(Hexy.createTiles(5)));
      setLastScore(lastScore + target);
      setTarget(Math.floor(target * 1.2));
    }
  }, [score, lastScore, target]);

  const handleClick: React.MouseEventHandler = ({ nativeEvent: { offsetX, offsetY } }) => {
    const pt = grid.pointToHex({ x: offsetX, y: offsetY });
    // can place in empty tile next to a placed tile
    if (stack.length > 0 && !Hexy.has(grid, pt) && Hexy.neighborsOf(grid, pt).some(n => Hexy.has(grid, n))) {
      const [{ id, type }, ...rest] = stack;
      pt.id = id;
      pt.type = type;
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
    setStack(Hexy.createTiles());
  };

  const width = 800;
  const height = 600;
  return (
    <div className="App">
      <header>
        <h1>Cartographer's Guild</h1>
        <button onClick={newGame}>New game</button>
        <button disabled={stack.length > 40} onClick={() => setStack(s => s.concat(Hexy.createTiles(5)))}>
          Add 5
        </button>
      </header>

      <svg className="cartograph" width={width} height={height} onClick={handleClick}>
        <rect className="background" width="100%" height="100%" fill="linen" fillOpacity={0.7} />

        <g className="board">
          <Board grid={grid} next={stack[0]} points={points} />
        </g>

        <g className="score" transform={`translate(0 ${height})`}>
          <Scorebox lastScore={lastScore} score={score} target={target} />
        </g>
      </svg>

      <TileStack height={height} hex={grid.getHex({ col: 0, row: 0 })} stack={stack} />
    </div>
  );
};

interface BoardProps {
  grid: MyGrid;
  next?: Tile;
  points?: number;
}

const Board: React.FC<BoardProps> = ({ grid, next, points }) => {
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

  const lastAdded = hexes[hexes.length - 1];
  return (
    <AnimatePresence>
      {hexes.map(hex => (
        <motion.polygon
          key={Hexy.id(hex, 'tile')}
          points={Hexy.points(hex)}
          fill={TERRAIN_COLORS[hex.type]}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.3 }}
        />
      ))}
      {next &&
        Array.from(neighbors.values()).map(hex => (
          <motion.polygon
            key={Hexy.id(hex, 'empty')}
            points={Hexy.points(hex)}
            className="open"
            fill="#B0C4DE" // lightsteelblue
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.2, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ delay: 0.1 }}
            whileHover={{ fill: TERRAIN_COLORS[next.type], opacity: 0.33, scale: 1 }}
          />
        ))}
      {/* points earned from last move; appears on last added tile */}
      {points ? (
        <motion.text
          key={lastAdded.id}
          x={lastAdded.x}
          y={lastAdded.y}
          textAnchor="middle"
          dominantBaseline="middle"
          initial={{ translateY: 10, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: -10, opacity: 0 }}
        >
          +{points}
        </motion.text>
      ) : null}
    </AnimatePresence>
  );
};
Board.displayName = 'Board';

interface ScoreProps {
  score: number;
  lastScore: number;
  target: number;
}

const Scorebox: React.FC<ScoreProps> = ({ score, lastScore, target }) => (
  <AnimatePresence>
    {/* total score */}
    <text key="score" x="50%" y={-15} fontSize="2em" textAnchor="middle">
      {score}
    </text>
    {/* target score for next reward */}
    <motion.text
      key={`target-${target}`}
      x="99%"
      fillOpacity={0.5}
      textAnchor="end"
      initial={{ y: 0 }}
      animate={{ y: -15 }}
      exit={{ y: -30, opacity: 0 }}
    >
      {lastScore + target}
    </motion.text>
    {/* progress bar to reward */}
    <motion.rect
      key={`progress-${target}`}
      x={0}
      y={-5}
      height={5}
      fill="maroon"
      initial={{ width: 0 }}
      animate={{ width: 100 * Math.min(1, (score - lastScore) / target) + '%', opacity: 1 }}
      exit={{ width: '100%', opacity: 0, scaleY: 4, transformOrigin: 'bottom' }}
    />
  </AnimatePresence>
);
Scorebox.displayName = 'Scorebox';

interface StackProps {
  height: number;
  hex: MyHex;
  stack: Tile[];
}

const TileStack: React.FC<StackProps> = ({ height, hex, stack }) => {
  const stackPoints = Hexy.points(hex);
  return (
    <svg className="storage" width={Hexy.size * 2} height={height}>
      <AnimatePresence>
        {stack
          .map((t, i) => {
            const translateY = height - 5 - (stack.length - i) * 10;
            return (
              <motion.g
                key={`stack-${t.id}`}
                initial={{ opacity: 0.3, translateX: Hexy.size * 3, translateY }}
                animate={{ opacity: 1, translateX: Hexy.size, translateY }}
                exit={{ opacity: 0, scale: 1.5, translateX: 0 }}
              >
                <polygon points={stackPoints} stroke="white" strokeWidth={2} fill={TERRAIN_COLORS[t.type]} />
              </motion.g>
            );
          })
          // so the first one is one top
          .reverse()}
      </AnimatePresence>

      {/* stack count */}
      <g transform={`translate(${Hexy.size}, ${height - 15})`}>
        <rect fill="white" rx={6} x={-12} y={-15} width={24} height={20} />
        <text fill={stack.length > 2 ? 'inherit' : 'red'} textAnchor="middle">
          {stack.length || 'END'}
        </text>
      </g>
    </svg>
  );
};
TileStack.displayName = 'TileStack';

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
