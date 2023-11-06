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
);

/**
 * this function sets the viewing option for the chart graph
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
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
        //to enable in drag to zoom option
        // modifierKey: 'ctrl',
      },
      limits: {
        x: {
          min: data ? Math.min(...data.map((item) => item.minX)) : 0,
          max: data ? Math.max(...data.map((item) => item.maxX)) : 100,
          minRange: 20,
        },
      },
      zoom: {
        // vv drag to zoom option could be a solution vv
        // drag: {
        //   enabled: true,
        // },
        //  ^^ here ^^
        pinch: {
          enabled: true, // Enable pinch zooming
        },
        wheel: {
          enabled: true, // Enable wheel zooming
        },
        mode: 'x',
      },
    },
  },
  scales: scales,
});

interface Props {
  data?: ConditionsGraphData[];
}
/**
 * The Graph displaying the road parameter data in the Inspect Page
 * @author Muro, Kerbourc'h
 */
const ConditionsGraph: FC<Props> = ({ data }) => {
  const ref = useRef<Chart<'scatter', { x: number; y: number }[]>>(null);
  const [graphLines, setGraphLines] =
    useState<ChartData<'scatter', { x: number; y: number }[]>>();

  useEffect(() => {
    if (ref.current === null) return;
    const chart = ref.current;
    chart.update();
  }, [ref, data]);

  useEffect(() => {
    if (data === undefined) {
      setGraphLines(undefined);
      return;
    }
    setGraphLines({
      //type: 'scatter',
      datasets: data.map((item) => {
        return {
          showLine: true,
          label: item.type,
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          fill: false,
          data: item.dataValues,
          yAxisID: item.type,
        };
      }),
    });
  }, [data]);

  // attach events to the graph options
  const graphOptions: ChartOptions<'scatter'> = useMemo(() => {
    let scales: DeepPartial<ScaleChartOptions<'scatter'>> = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'distance (m)',
          },
          ticks: {
            stepSize: 10,
            callback: (tick: string | number) =>
              Math.round(parseFloat(tick.toString())),
          },
        },
      },
    };

    data?.forEach((item) => {
      if (scales.scales === undefined) return;
      scales.scales[item.type] = {
        type: 'linear',
        position: 'left',
        display: 'auto',
        min: item.minY - 1,
        max: item.maxY + 1,
        title: {
          display: true,
          text: item.type,
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
  }, [data]);

  return (
    <div className="road-conditions-graph">
      {data && graphLines && (
        <Scatter ref={ref} data={graphLines} options={graphOptions} />
      )}
    </div>
  );
};

export default ConditionsGraph;
