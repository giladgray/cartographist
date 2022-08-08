import { AnimatePresence, motion, MotionProps, Point, SVGMotionProps } from 'framer-motion';
import React, { useState } from 'react';

import { HexTile } from './HexTile';
import { Hexy, MyGrid, MyHex, Tile } from './Hexy';

interface BoardProps {
  grid: MyGrid;
  next?: Tile;
  points?: number;
  onAdd: (hex: MyHex) => void;
}

export const Board: React.FC<BoardProps> = ({ grid, next, points, onAdd }) => {
  const [cursor, setCursor] = useState<MyHex>();
  const [rotate, setRotate] = useState(0);
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
    <g
      className="board"
      onClick={e => {
        if (next) {
          const hex = Hexy.eventToHex(grid, e.nativeEvent).clone(next);
          hex.terrain = Hexy.rotate(hex.terrain, rotate);
          onAdd(hex);
        }
      }}
      onContextMenu={e => {
        e.preventDefault();
        e.button === 2 && setRotate(r => r + (e.shiftKey ? -1 : 1));
      }}
      onMouseMove={e => setCursor(Hexy.eventToHex(grid, e.nativeEvent))}
      onMouseLeave={() => setCursor(undefined)}
    >
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
        {next && cursor && Hexy.has(neighbors, cursor) ? (
          <Cursor center={Hexy.center(cursor)} hex={grid.getHex().clone({ terrain: next.terrain })} rotate={rotate} />
        ) : null}
      </AnimatePresence>
    </g>
  );
};
Board.displayName = 'Board';

const Cursor: React.FC<{ hex: MyHex; center: Point; rotate: number }> = ({ hex, center, rotate }) => {
  const animate = { translateX: center.x, translateY: center.y, rotate: rotate * 60 };
  return (
    <motion.g initial={animate} animate={animate}>
      <HexTile key="cursor" hex={hex} fillOpacity={0.5} {...CURSOR_MOTION} />
    </motion.g>
  );
};
Cursor.displayName = 'Cursor';

const TILE_MOTION: MotionProps = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.3 },
};
const CURSOR_MOTION: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1, scale: 0.8 },
  exit: { opacity: 0, scale: 0.3 },
};

const EMPTY_MOTION: MotionProps = {
  initial: { opacity: 0, scale: 0.6 },
  animate: { opacity: 0.2, scale: 1 },
  exit: { opacity: 0, scale: 0.6 },
  transition: { delay: 0.1 },
};

const TEXT_MOTION: SVGMotionProps<SVGTextElement> = {
  textAnchor: 'middle',
  dominantBaseline: 'middle',
  initial: { translateY: 10, opacity: 0 },
  animate: { translateY: 0, opacity: 1 },
  exit: { translateY: -10, opacity: 0 },
};
