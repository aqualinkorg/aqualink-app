import L from "leaflet";
import celsiusLegend from "../../../assets/celsiusLegend.png";
import fahrenheitLegend from "../../../assets/fahrenheitLegend.png";

const legend = new L.Control({ position: "bottomleft" });

legend.onAdd = () => {
  const div = L.DomUtil.create("div", "info-legend");
  div.innerHTML = `
    <img src="${celsiusLegend}" alt="surface-temperature-legend" />
    <img src="${fahrenheitLegend}" alt="surface-temperature-legend" />
  `;

  return div;
};

export const seaSurfaceTemperatureLegend = legend;
