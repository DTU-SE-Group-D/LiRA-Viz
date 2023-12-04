import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActiveElement,
  CategoryScale,
  Chart,
  ChartData,
  ChartEvent,
  ChartOptions,
  ChartTypeRegistry,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScaleChartOptions,
  Title,
  Tooltip,
} from 'chart.js';
import 'chart.js/auto';
import { Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { ConditionsGraphData } from '../../models/conditions';
import { DeepPartial } from 'chart.js/dist/types/utils';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  annotationPlugin,
);

/**
 * this function sets the viewing option for the chart graph
 *
 * @param data the data to be displayed in the graph
 * @param scales the scales of the graph
 *
 * @author Muro
 **/
const options = (
  data?: ConditionsGraphData[],
  scales?: DeepPartial<ScaleChartOptions<'scatter'>>,
): ChartOptions<'scatter'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { color: 'white' },
      onClick() {},
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
      },
      limits: {
        x: {
          min: data ? Math.min(...data.map((item) => item.minX)) : 0,
          max: data ? Math.max(...data.map((item) => item.maxX)) : 100,
          minRange: 20,
        },
      },
      zoom: {
        pinch: {
          enabled: true, // Enable pinch zooming
        },
        wheel: {
          enabled: true, // Enable wheel zooming
        },
        mode: 'x',
      },
    },
    annotation: {
      annotations: {
        yellowBox: {
          type: 'box',
          backgroundColor: 'rgba(255, 255, 104, 0)',
          borderColor: 'rgba(255, 240, 0, 0)',
          borderRadius: 4,
          borderWidth: 1.2,
          xMin: 0,
          xMax: 0,
          yMin: data ? Math.min(...data.map((item) => item.minY)) - 1 : 0,
          yMax: data ? Math.max(...data.map((item) => item.maxY)) + 1 : 0,
        },
        yellowLine: {
          type: 'line',
          xMin: 0,
          xMax: 0,
          borderColor: 'rgba(255, 240, 0, 0)',
          borderWidth: 2,
        },
      },
    },
  },
  scales: scales,
});

/**
 * this function sets the colors for the lines in the graph
 *
 * @author Muro
 **/
const selectColor = (index: number) => {
  const colors = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)',
    'rgb(255, 99, 132)',
  ];
  return colors[index % colors.length];
};

interface Props {
  /** The data to display and the constraints of the graph data */
  data?: ConditionsGraphData[];
  /** The distance shown in the Road surface images component */
  inspectedRoadDistanceArea?: number[] | null;
}

/**
 * The Graph displaying the road parameter data in the Inspect Page
 *
 * @author Muro, Kerbourc'h
 */
const ConditionsGraph: FC<Props> = ({ data, inspectedRoadDistanceArea }) => {
  const ref = useRef<Chart<'scatter', { x: number; y: number }[]>>(null);
  const [graphLines, setGraphLines] =
    useState<ChartData<'scatter', { x: number; y: number }[]>>();

  // the indicators types that have been seen at least one time by this component. Use to remove empty axis
  const [previousTypes, setPreviousTypes] = useState<string[]>([]);

  useEffect(() => {
    if (
      !inspectedRoadDistanceArea ||
      inspectedRoadDistanceArea[0] > inspectedRoadDistanceArea[1]
    )
      return;

    if (ref.current === null) return;
    const chart = ref.current;

    if (
      // @ts-ignore
      chart.options?.plugins?.annotation?.annotations?.yellowBox === undefined
    )
      return;

    // Restore the colors now that we have distances to draw the yellow box and line
    // @ts-ignore
    chart.options.plugins.annotation.annotations.yellowBox.backgroundColor =
      'rgba(255, 255, 104, 0.35)';
    // @ts-ignore
    chart.options.plugins.annotation.annotations.yellowBox.borderColor =
      'rgba(255, 240, 0)';
    // @ts-ignore
    chart.options.plugins.annotation.annotations.yellowLine.borderColor =
      'rgba(255, 240, 0)';

    // Put the right distances to draw the yellow box and line
    // @ts-ignore
    chart.options.plugins.annotation.annotations.yellowBox.xMin =
      inspectedRoadDistanceArea[0];
    // @ts-ignore
    chart.options.plugins.annotation.annotations.yellowBox.xMax =
      inspectedRoadDistanceArea[1];

    // @ts-ignore
    chart.options.plugins.annotation.annotations.yellowLine.xMin =
      inspectedRoadDistanceArea
        ? (inspectedRoadDistanceArea[0] + inspectedRoadDistanceArea[1]) / 2
        : 0;
    // @ts-ignore
    chart.options.plugins.annotation.annotations.yellowLine.xMax =
      inspectedRoadDistanceArea
        ? (inspectedRoadDistanceArea[0] + inspectedRoadDistanceArea[1]) / 2
        : 0;

    chart.update();
  }, [ref, inspectedRoadDistanceArea]);

  useEffect(() => {
    if (data === undefined) {
      setGraphLines(undefined);
      return;
    }

    setGraphLines({
      datasets: data.map((item, index) => {
        return {
          showLine: true,
          label: item.type,
          backgroundColor: selectColor(index),
          borderColor: selectColor(index),
          borderWidth: 2,
          pointStyle: 'circle',
          pointRadius: 4,
          pointHoverRadius: 8,
          fill: false,
          data: item.dataValues,
          yAxisID: item.type,
        };
      }),
    });
  }, [data]);

  // attach events to the graph options
  const graphOptions: ChartOptions<'scatter'> = useMemo(() => {
    const scales: DeepPartial<ScaleChartOptions<'scatter'>> = {
      scales: {
        x: {
          grid: {
            color: 'rgba(255,255,255,0.15)',
          },
          title: {
            display: true,
            text: 'distance (m)',
            color: 'white',
            font: {
              size: 14,
            },
          },
          ticks: {
            color: 'white',
            stepSize: 10,
            callback: (tick: string | number) =>
              Math.round(parseFloat(tick.toString())),
            font: {
              size: 13,
            },
          },
          border: {
            color: 'rgba(255,255,255,0.65)',
            width: 2,
          },
        },
      },
    };

    // hide every axis that have been seen until now
    previousTypes.forEach((type) => {
      if (scales.scales === undefined) return;
      scales.scales[type] = {
        display: false,
      };
    });

    // show axis that currently have data
    data?.forEach((item) => {
      if (scales.scales === undefined) return;

      scales.scales[item.type] = {
        grid: {
          color: 'rgba(255,255,255,0.15)',
        },
        type: 'linear',
        position: 'left',
        display: 'auto',
        min: item.minY - 1,
        max: item.maxY + 1,
        title: {
          display: true,
          text: item.type,
          color: 'white',
          font: {
            size: 14,
          },
        },
        ticks: {
          color: 'white',
          font: {
            size: 13,
          },
        },
        border: {
          color: 'rgba(255,255,255,0.65)',
          width: 2,
        },
      };
    });

    return {
      ...options(data, scales.scales),
      onClick: (
        event: ChartEvent,
        elts: ActiveElement[],
        _chart: Chart<keyof ChartTypeRegistry, number[], unknown>,
      ) => {
        if (elts.length === 0) return;
        const elt = elts[0]; // doesnt work if multiple datasets
        const pointIndex = elt.index;
        console.log(pointIndex, event, elts);
      },
    };
  }, [data]); // don't update when previousTypes changes, bacause it's only use to store the previous show axis

  // When graphOptions changes, update the previousTypes so that at the next update of data,
  // the current axis will be hidden (except if they still have values).
  useEffect(() => {
    if (data === undefined) return;
    setPreviousTypes(Array.from(new Set(data.map((item) => item.type))));
  }, [graphOptions]);

  useEffect(() => {
    if (ref.current === null) return;

    console.log(graphOptions);
    const chart = ref.current;
    chart.update();
  }, [ref, graphLines]);

  return (
    <div className="road-conditions-graph">
      {data && graphLines && (
        <>
          <Scatter ref={ref} data={graphLines} options={graphOptions} />
        </>
      )}
    </div>
  );
};

export default ConditionsGraph;
