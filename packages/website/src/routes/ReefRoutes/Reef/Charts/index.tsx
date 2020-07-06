import React, { useRef, useState, useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  Grid,
} from "@material-ui/core";
import { Line } from "react-chartjs-2";

import Tooltip from "./tooltip";

require("../../../../helpers/backgroundPlugin");
require("../../../../helpers/fillPlugin");
require("../../../../helpers/slicePlugin");
require("../../../../helpers/thresholdPlugin");

const Charts = ({ classes }: ChartsProps) => {
  const temperatureChartRef = useRef<Line>(null);
  const windChartRef = useRef<Line>(null);
  const waveChartRef = useRef<Line>(null);
  const bleachingThreshold = 33.5;
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState({
    date: "",
    temperature: 0,
    wind: 0,
    wave: 0,
  });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [updateChart, setUpdateChart] = useState<boolean>(false);
  const [sliceAtLabel, setSliceAtLabel] = useState<string | null>(null);
  const [thresholdTextPosition, setThresholdTextPosition] = useState<number>(0);

  const chartLabels = [
    "MAY 1",
    "MAY 2",
    "MAY 3",
    "MAY 4",
    "MAY 5",
    "MAY 6",
    "MAY 7",
    "MAY 8",
  ];
  const temperatureData = [32.4, 32.7, 32.5, 32.7, 32.7, 33.5, 34.1, 34.3];
  const windData = [11.1, 11.3, 11.7, 11, 11.6, 11.8, 12.1, 12.4];
  const waveData = [1, 1.3, 1.2, 1.6, 1, 1.2, 1.4, 1.2];

  let resizeTimout: NodeJS.Timeout;
  window.addEventListener("resize", () => {
    setUpdateChart(true);
    clearTimeout(resizeTimout);
    resizeTimout = setTimeout(() => {
      setUpdateChart(false);
    }, 1);
  });

  const data = (
    labels: string[],
    dataArray: number[],
    gradiendPercenage: number,
    fill: boolean
  ) => (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    let gradient;
    if (ctx) {
      gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, "rgba(22, 141, 189, 0.29)");
      gradient.addColorStop(gradiendPercenage, "rgba(22, 141, 189, 0)");
    }

    return {
      labels,
      datasets: [
        {
          label: "overflow-dataset",
          data: dataArray,
          fill,
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1.5,
          pointBackgroundColor: "#ffffff",
          pointBorderWidth: 1.5,
          pointRadius: 3,
          cubicInterpolationMode: "monotone",
        },
        {
          label: "gradient-dataset",
          data: dataArray,
          backgroundColor: gradient,
          borderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#ffffff",
          pointBorderWidth: 0,
          pointRadius: 0,
          cubicInterpolationMode: "monotone",
        },
      ],
    };
  };

  const customTooltip = (ref: React.RefObject<Line>) => (tooltipModel: any) => {
    const chart = ref.current;
    if (!chart) {
      return;
    }
    if (showTooltip) {
      setShowTooltip(false);
      return;
    }
    const position = chart.chartInstance.canvas.getBoundingClientRect();
    const left = position.left + tooltipModel.caretX - 5;
    const top = position.top + tooltipModel.caretY - 5;
    const date =
      tooltipModel.dataPoints &&
      tooltipModel.dataPoints[0] &&
      tooltipModel.dataPoints[0].xLabel;
    const index = date && chartLabels.findIndex((item) => item === date);
    if (index > -1) {
      setTooltipPosition({ top, left });
      setTooltipData({
        date,
        temperature: temperatureData[index],
        wind: windData[index],
        wave: waveData[index],
      });
      setShowTooltip(true);
      setSliceAtLabel(date);
    }
  };

  useEffect(() => {
    const chart = temperatureChartRef.current;

    if (chart) {
      const yScale = chart.chartInstance.scales["y-axis-0"];
      setThresholdTextPosition(yScale.getPixelForValue(bleachingThreshold));
    }
  }, [setThresholdTextPosition]);

  return (
    <>
      <Grid id="threshold-text-container" item>
        <Grid
          style={{ position: "relative", top: thresholdTextPosition }}
          direction="column"
          container
        >
          <Typography variant="caption">Bleaching</Typography>
          <Typography variant="caption">Threshold</Typography>
          <Typography variant="caption">(Mean)</Typography>
        </Grid>
      </Grid>
      <Grid className={classes.chartContainer} item xs={9}>
        <div className={classes.root}>
          <Typography
            style={{ marginLeft: "4rem", fontWeight: "normal" }}
            variant="h6"
          >
            MEAN DAILY WATER TEMPERATURE AT 25M (C&deg;)
          </Typography>
          <Line
            ref={temperatureChartRef}
            options={{
              plugins: {
                chartJsPluginBarchartBackground: {
                  color: "rgb(158, 166, 170, 0.07)",
                  mode: "odd",
                },
                fillPlugin: {
                  datasetIndex: 0,
                  zeroLevel: bleachingThreshold,
                  bottom: 27,
                  top: 35,
                  color: "rgba(250, 141, 0, 1)",
                  updateChart,
                },
                sliceDrawPlugin: {
                  sliceAtLabel,
                  datasetIndex: 0,
                },
                thresholdPlugin: {
                  threshold: bleachingThreshold,
                },
              },
              tooltips: {
                filter: (tooltipItem: any) => {
                  return tooltipItem.datasetIndex === 0;
                },
                enabled: false,
                custom: customTooltip(temperatureChartRef),
              },
              legend: {
                display: false,
              },
              scales: {
                xAxes: [
                  {
                    ticks: {
                      padding: 10,
                      labelOffset: -100,
                      callback: () => " ".repeat(2 * chartLabels[0].length),
                    },
                    gridLines: {
                      display: false,
                      drawTicks: false,
                    },
                  },
                ],
                yAxes: [
                  {
                    gridLines: {
                      drawTicks: false,
                    },
                    display: true,
                    ticks: {
                      steps: 4,
                      min: 27,
                      stepSize: 1,
                      max: 35,
                      callback: (value: number) => {
                        if (value % 2 === 1) {
                          return `    ${value}\u00B0   `;
                        }
                        return null;
                      },
                    },
                  },
                ],
              },
            }}
            height={60}
            data={data(chartLabels, temperatureData, 0.6, true)}
          />
          <Typography
            style={{ margin: "2rem 0 0 4rem", fontWeight: "normal" }}
            variant="h6"
          >
            MEAN DAILY WIND SPEED (KPH)
          </Typography>
          <Line
            ref={windChartRef}
            options={{
              plugins: {
                chartJsPluginBarchartBackground: {
                  color: "rgb(158, 166, 170, 0.07)",
                  mode: "odd",
                },
                sliceDrawPlugin: {
                  sliceAtLabel,
                  datasetIndex: 0,
                },
              },
              tooltips: {
                filter: (tooltipItem: any) => {
                  return tooltipItem.datasetIndex === 0;
                },
                enabled: false,
                custom: customTooltip(windChartRef),
              },
              legend: {
                display: false,
              },
              scales: {
                xAxes: [
                  {
                    ticks: {
                      padding: 10,
                      labelOffset: -100,
                      callback: () => " ".repeat(2 * chartLabels[0].length),
                    },
                    gridLines: {
                      display: false,
                      drawTicks: false,
                    },
                  },
                ],
                yAxes: [
                  {
                    gridLines: {
                      drawTicks: false,
                    },
                    display: true,
                    ticks: {
                      steps: 2,
                      min: 5,
                      stepSize: 5,
                      max: 15,
                      callback: (value: number) => {
                        return ` ${value}kph  `;
                      },
                    },
                  },
                ],
              },
            }}
            height={30}
            data={data(chartLabels, windData, 0.3, false)}
          />
          <Typography
            style={{ margin: "2rem 0 0 4rem", fontWeight: "normal" }}
            variant="h6"
          >
            MEAN DAILY WAVE HEIGHT (M)
          </Typography>
          <Line
            ref={waveChartRef}
            options={{
              plugins: {
                chartJsPluginBarchartBackground: {
                  color: "rgb(158, 166, 170, 0.07)",
                  mode: "odd",
                },
                sliceDrawPlugin: {
                  sliceAtLabel,
                  datasetIndex: 0,
                },
              },
              tooltips: {
                filter: (tooltipItem: any) => {
                  return tooltipItem.datasetIndex === 0;
                },
                enabled: false,
                custom: customTooltip(waveChartRef),
              },
              legend: {
                display: false,
              },
              scales: {
                xAxes: [
                  {
                    ticks: {
                      padding: 10,
                      labelOffset: -100,
                    },
                    gridLines: {
                      display: false,
                      drawTicks: false,
                    },
                  },
                ],
                yAxes: [
                  {
                    gridLines: {
                      drawTicks: false,
                    },
                    display: true,
                    ticks: {
                      steps: 3,
                      min: 0.5,
                      stepSize: 0.5,
                      max: 2,
                      callback: (value: number) => {
                        return `   ${value}m  `;
                      },
                    },
                  },
                ],
              },
            }}
            height={30}
            data={data(chartLabels, waveData, 0.3, false)}
          />
          {showTooltip ? (
            <div
              onMouseLeave={() => {
                setShowTooltip(false);
                setSliceAtLabel(null);
              }}
              className="chart-tooltip"
              style={{
                position: "fixed",
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              }}
            >
              <Tooltip data={tooltipData} />
            </div>
          ) : null}
        </div>
      </Grid>
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      height: "100%",
    },
    chartContainer: {
      height: "30vh",
    },
  });

type ChartsProps = WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
