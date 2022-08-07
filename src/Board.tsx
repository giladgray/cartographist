import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { TERRAIN_COLORS } from './const';
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
