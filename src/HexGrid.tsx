import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { Board } from './Board';
import { Hexy } from './Hexy';
import { GameState, useGameReducer } from './reducer';
import { TileStack } from './TileStack';

export const HexGrid: React.FC = () => {
  const [grid, setGrid] = useState(Hexy.create);
  const [stack, setStack] = useState(Hexy.createTiles);
  const [score, actions] = useGameReducer();

  // award more tiles for reaching the target
  useEffect(() => setStack(s => s.concat(Hexy.createTiles(5))), [score.level]);

  const handleClick: React.MouseEventHandler = ({ nativeEvent: { offsetX, offsetY } }) => {
    const pt = grid.pointToHex({ x: offsetX, y: offsetY });
    // can place in empty tile next to a placed tile
    if (stack.length > 0 && !Hexy.has(grid, pt) && Hexy.neighborsOf(grid, pt).some(n => Hexy.has(grid, n))) {
      const [head, ...rest] = stack;
      setStack(rest);
      setGrid(grid.update(g => Hexy.set(g, pt.clone(head))));

      // award points for adding a tile
      const neighbors = Hexy.neighborsOf(grid, pt).filter(n => Hexy.get(grid, n)?.type === pt.type);
      actions.add(Math.max(1, neighbors.length ** 2));
    }
  };

  const newGame = () => {
    actions.reset();
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

        <Board grid={grid} next={stack[0]} points={score.lastPoints} />

        <g className="score" transform={`translate(0 ${height})`}>
          <Scorebox {...score} />
        </g>
      </svg>

      <TileStack height={height} hex={grid.getHex({ col: 0, row: 0 })} stack={stack} />
    </div>
  );
};
HexGrid.displayName = 'HexGrid';

const Scorebox: React.FC<GameState> = ({ score, lastTarget, target }) => (
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
      {lastTarget + target}
    </motion.text>
    {/* progress bar to reward */}
    <motion.rect
      key={`progress-${target}`}
      x={0}
      y={-5}
      height={5}
      fill="maroon"
      initial={{ width: 0 }}
      animate={{ width: 100 * Math.min(1, (score - lastTarget) / target) + '%', opacity: 1 }}
      exit={{ width: '100%', opacity: 0, scaleY: 4, transformOrigin: 'bottom' }}
    />
  </AnimatePresence>
);
Scorebox.displayName = 'Scorebox';

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
