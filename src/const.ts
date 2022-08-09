export enum TerrainType {
  PLAIN,
  DESERT,
  FOREST,
  MOUNTAIN,
  WATER,
}

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.PLAIN]: '#d71868',
  [TerrainType.DESERT]: '#E1C16E',
  [TerrainType.FOREST]: '#228B22',
  [TerrainType.MOUNTAIN]: '#696969',
  [TerrainType.WATER]: '#0096FF',
};
