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
  Plugin,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const options = (): ChartOptions<'scatter'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { color: 'white' },
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
      title: {
        display: true,
        text: 'KPI',
      },
    },
    DI: {
      type: 'linear',
      position: 'right',
      display: 'auto',
      title: {
        display: true,
        text: 'DI',
      },
    },
  },
});

interface Props {
  data: ChartData<'scatter', number[], number> | undefined;
}

const ConditionsGraph: FC<Props> = ({ data }) => {
  const ref = useRef<Chart<'scatter', number[], number>>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const chart = ref.current;
    chart.update();
  }, [ref, data]);

  // attach events to the graph options
  const graphOptions: ChartOptions<'scatter'> = useMemo(
    () => ({
      ...options(),
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
    [],
  );

  const plugins: Plugin<'scatter'>[] = [
    {
      id: 'id',
    },
  ];

  return (
    <div className="road-conditions-graph">
      {data && (
        <Scatter
          ref={ref}
          data={data}
          options={graphOptions}
          plugins={plugins}
        />
      )}
    </div>
  );
};

export default ConditionsGraph;
