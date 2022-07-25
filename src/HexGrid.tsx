import { add, CompassDirection, createHexPrototype, Grid, Hex, neighborOf } from 'honeycomb-grid';
import React, { useMemo, useState } from 'react';

const HEX = createHexPrototype({ dimensions: 30 });

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

function newGrid() {
  return new Grid(HEX, add([3, 5], [2, 5], [3, 4]));
}

export const HexGrid: React.FC = () => {
  const [grid, setGrid] = useState(newGrid);

  const hexes: Hex[] = [];
  grid.run(hex => hexes.push(hex));

  const neighbors = new Map<string, Hex>();
  grid.run(hex => {
    for (const d of DIRECTIONS) {
      const n = grid.getHex(neighborOf(hex, d));
      if (!grid.store.has(n.toString())) {
        neighbors.set(n.toString(), n);
      }
    }
  });

  const borders = Array.from(neighbors.values());

  const handleClick: React.MouseEventHandler = ({ nativeEvent: { offsetX, offsetY } }) => {
    const pt = grid.pointToHex({ x: offsetX, y: offsetY });
    if (!DIRECTIONS.some(d => grid.store.has(grid.getHex(neighborOf(pt, d)).toString()))) return;
    setGrid(
      grid.update(g => {
        g.store.set(pt.toString(), pt);
      })
    );
  };

  const width = 500;
  const height = 500;

  return (
    <div className="App">
      <header>
        <button onClick={() => setGrid(newGrid())}>New game</button>
      </header>

      <svg width={width} height={height} onClick={handleClick}>
        <rect width="100%" height="100%" fill="lightblue" />

        {hexes.map((hex, i) => (
          <polygon key={`tile-${i}`} points={hexPoints(hex)} fill="green" />
        ))}
        {borders.map((hex, i) => (
          <polygon key={`empty-${i}`} points={hexPoints(hex)} className="open" fill="cornflowerblue" />
        ))}
      </svg>
    </div>
  );
};

function hexPoints(hex: Hex): string {
  return hex.corners.map(c => `${c.x} ${c.y}`).join(',');
}

/*
ROADMAP
- rules about placing
  x must have 1+ neighbor
- several terrain types
  - plain
  - forest
  - mountain
  - water
  - desert?
  - tundra?
  - swamp?
- draw percentage of terrain types
- each tile edge has terrain type
- stack of incoming tiles
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
