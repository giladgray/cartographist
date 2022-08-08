import { motion, SVGMotionProps } from 'framer-motion';
import React from 'react';

import { TERRAIN_COLORS } from './const';
import { Hexy, MyHex } from './Hexy';

interface Props extends SVGMotionProps<SVGGElement> {
  hex: MyHex;
}

export const HexTile = React.memo<Props>(props => {
  const { hex } = props;
  const center = Hexy.center(hex);
  return (
    <motion.g className="hex" {...props}>
      {hex.corners.map((pt, i, corners) => (
        <polygon
          key={i}
          fill={TERRAIN_COLORS[hex.terrain[i]]}
          points={[center, pt, corners[(i + 1) % corners.length]]
            .map(c => `${Math.round(c.x)} ${Math.round(c.y)}`)
            .join(',')}
        />
      ))}
    </motion.g>
  );
});
HexTile.displayName = 'HexTile';

function makeGradient(hex: MyHex) {
  return `conic-gradient(${hex.terrain.map((t, i) => `${TERRAIN_COLORS[t]} ${i * 60}deg`)})`;
}
