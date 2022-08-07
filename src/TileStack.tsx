import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { HexTile } from './HexTile';
import { Hexy, MyHex, Tile } from './Hexy';

interface StackProps {
  height: number;
  hex: MyHex;
  stack: Tile[];
}

export const TileStack: React.FC<StackProps> = ({ height, hex, stack }) => (
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
              <HexTile hex={hex.clone({ type: t.type })} stroke="white" strokeWidth={2} />
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
TileStack.displayName = 'TileStack';
