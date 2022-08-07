import { motion, MotionProps } from 'framer-motion';
import React from 'react';

import { TERRAIN_COLORS } from './const';
import { Hexy, MyHex, Tile } from './Hexy';

interface Props extends React.SVGAttributes<SVGPolygonElement> {
  hex: MyHex;
}

export const HexTile = motion<Props>(props => (
  <polygon fill={TERRAIN_COLORS[props.hex.type]} points={Hexy.points(props.hex)} {...props} />
));
HexTile.displayName = 'HexTile';
