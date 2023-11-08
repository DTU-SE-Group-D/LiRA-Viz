import { FC, useEffect, useMemo, useRef } from 'react';
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
  Title,
  Tooltip,
} from 'chart.js';
import 'chart.js/auto';
import { Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

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

const options = (minAndMax: number[]): ChartOptions<'scatter'> => ({
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
        x: { min: 0, max: 100, minRange: 20 },
        y: { min: 0, max: 10 },
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
    //TODO will be a variable passed from parent
    KPI: {
      type: 'linear',
      position: 'left',
      display: 'auto',
      min: Math.floor(minAndMax[0]),
      max: Math.ceil(minAndMax[1]),
      title: {
        display: true,
        text: 'KPI',
      },
    },
    DI: {
      type: 'linear',
      position: 'right',
      display: 'auto',
      min: Math.floor(minAndMax[2]),
      max: Math.ceil(minAndMax[3]),
      title: {
        display: true,
        text: 'DI',
      },
    },
  },
});

interface Props {
  data: ChartData<'scatter', number[], number> | undefined;
  minAndMax: number[];
}

/**
 * The Graph displaying the road parameter data in the Inspect Page
 * @author Muro
 */
const ConditionsGraph: FC<Props> = ({ data, minAndMax }) => {
  const ref = useRef<Chart<'scatter', number[], number>>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const chart = ref.current;
    chart.update();
  }, [ref, data]);

  // attach events to the graph options
  const graphOptions: ChartOptions<'scatter'> = useMemo(
    () => ({
      ...options(minAndMax),
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
    }),
    [minAndMax],
  );

  return (
    <div className="road-conditions-graph">
      {data && <Scatter ref={ref} data={data} options={graphOptions} />}
    </div>
  );
};

export default ConditionsGraph;
