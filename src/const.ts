export enum TerrainType {
  PLAIN,
  FOREST,
  MOUNTAIN,
  WATER,
}

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.PLAIN]: '#E1C16E',
  [TerrainType.FOREST]: '#228B22',
  [TerrainType.MOUNTAIN]: '#696969',
  [TerrainType.WATER]: '#0096FF',
};
