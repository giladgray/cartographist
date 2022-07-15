import React, { useMemo, useState } from "react";
import { createHexPrototype, Grid, Hex, spiral } from "honeycomb-grid";

const hex = createHexPrototype({ dimensions: 50})

const grid = new Grid(hex, spiral({ start: [2,6], radius: 4, }))

interface Cell {
  points: string;
  hex: Hex;
}

export const HexGrid: React.FC = () => {
  const [state, setState] = useState<Hex[]>([])
  const hexes = useMemo(() => {
    const array: Cell[] = []
    grid.each(hex => {
      array.push({hex, points: hex.corners.map(c => `${c.x} ${c.y}`).join(',')})
    }).run()
    return array;
  }, [])

  const handleClick: React.MouseEventHandler = ({nativeEvent: {offsetX, offsetY}}) => {
    const pt = grid.pointToHex({ x: offsetX, y: offsetY })
    setState(s => s.concat(pt))
  }

  return (
    <div className="App">
      <svg width={1000} height={1000} onClick={handleClick}>
        {hexes.map((h,i) => <polygon key={i} points={h.points} stroke='lightgray' fill={state.find(s => h.hex.equals(s)) ? 'green':'transparent'} />)}
      </svg>
    </div>
  );
}

/*
ROADMAP
- rules about placing
  - must have 1+ neighbor
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
