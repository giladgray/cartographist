import { AnimatePresence, motion, MotionProps, SVGMotionProps } from 'framer-motion';
import React from 'react';

import { HexTile } from './HexTile';
import { Hexy, MyGrid, MyHex, Tile } from './Hexy';

interface BoardProps {
  grid: MyGrid;
  next?: Tile;
  points?: number;
}

export const Board: React.FC<BoardProps> = ({ grid, next, points }) => {
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

  const last = hexes[hexes.length - 1];
  return (
    <g className="board">
      <AnimatePresence>
        {hexes.map(hex => (
          <HexTile hex={hex} key={Hexy.id(hex, 'tile')} {...TILE_MOTION} />
        ))}
        {next &&
          Array.from(neighbors.values()).map(hex => (
            <HexTile hex={hex} key={Hexy.id(hex, 'empty')} className="open" fill="#B0C4DE" {...EMPTY_MOTION} />
          ))}
        {/* points earned from last move; appears on last added tile */}
        {points ? (
          <motion.text key={last.id} x={last.x} y={last.y} {...TEXT_MOTION}>
            +{points}
          </motion.text>
        ) : null}
      </AnimatePresence>
    </g>
  );
};
Board.displayName = 'Board';

const TILE_MOTION: MotionProps = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.3 },
};

const EMPTY_MOTION: MotionProps = {
  initial: { opacity: 0, scale: 0.6 },
  animate: { opacity: 0.2, scale: 1 },
  exit: { opacity: 0, scale: 0.6 },
  transition: { delay: 0.1 },
  whileHover: { opacity: 0.6 },
  whileTap: { opacity: 1 },
};

const TEXT_MOTION: SVGMotionProps<SVGTextElement> = {
  textAnchor: 'middle',
  dominantBaseline: 'middle',
  initial: { translateY: 10, opacity: 0 },
  animate: { translateY: 0, opacity: 1 },
  exit: { translateY: -10, opacity: 0 },
};
