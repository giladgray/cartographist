import { motion, SVGMotionProps } from 'framer-motion';
import React from 'react';

import { TERRAIN_COLORS } from './const';
import { Hexy, MyHex } from './Hexy';

interface Props extends SVGMotionProps<SVGPolygonElement> {
  hex: MyHex;
}

export const HexTile: React.FC<Props> = props => (
  <motion.polygon fill={TERRAIN_COLORS[props.hex.type]} points={Hexy.points(props.hex)} {...props} />
);
HexTile.displayName = 'HexTile';
