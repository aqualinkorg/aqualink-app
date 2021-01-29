import L from "leaflet";
/* eslint-disable */
/*
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */

(function () {
  if (!L || !L.GridLayer || !L.GridLayer.prototype) return;

  const originalInitTile = L.GridLayer.prototype._initTile;
  L.GridLayer.include({
    _initTile: function (tile) {
      originalInitTile.call(this, tile);
      const tileSize = this.getTileSize();
      tile.style.width = tileSize.x + 1 + "px";
      tile.style.height = tileSize.y + 1 + "px";
    },
  });
})();
