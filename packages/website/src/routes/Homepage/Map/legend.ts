import L from "leaflet";
import legendImage from "../../../assets/legend.png";

const legend = new L.Control({ position: "bottomleft" });

legend.onAdd = () => {
  const div = L.DomUtil.create("div", "info legend");
  div.innerHTML = `<img src="${legendImage}" alt="surface-temperature-legend" />`;

  return div;
};

export const seaSurfaceTemperatureLegend = legend;
