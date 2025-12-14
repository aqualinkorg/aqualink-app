import L, { GridLayer } from 'leaflet';

/*
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */

(() => {
  if (!L || !L.GridLayer || !L.GridLayer.prototype) return;
  const gridLayerProto = L.GridLayer.prototype as GridLayer & {
    _initTile: (tile: HTMLImageElement) => void;
  };
  const originalInitTile = gridLayerProto._initTile;
  L.GridLayer.include({
    _initTile(tile: HTMLImageElement) {
      originalInitTile.call(this, tile);
      const tileSize = this.getTileSize();
      // eslint-disable-next-line fp/no-mutation
      tile.style.width = `${tileSize.x + 1}px`;
      // eslint-disable-next-line fp/no-mutation
      tile.style.height = `${tileSize.y + 1}px`;
    },
  });
})();
