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
import { Line } from 'react-chartjs-2';

import { ConditionType } from '../../models/graph';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const options = ({ name, min, max }: ConditionType): ChartOptions<'line'> => ({
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
        maxTicksLimit: 30,
        stepSize: 200,
        callback: (tick: string | number) =>
          Math.round(parseFloat(tick.toString())),
      },
    },
    y: {
      title: {
        display: true,
        text: name,
      },
      min: min,
      max: max,
    },
  },
});

interface Props {
  type: ConditionType;
  data: ChartData<'line', number[], number> | undefined;
}

const ConditionsGraph: FC<Props> = ({ type, data }) => {
  const ref = useRef<Chart<'line', number[], number>>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const chart = ref.current;
    chart.update();
  }, [ref, data]);

  // attach events to the graph options
  const graphOptions: ChartOptions<'line'> = useMemo(
    () => ({
      ...options(type),
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

  const plugins: Plugin<'line'>[] = [
    {
      id: 'id',
    },
  ];

  return (
    <div className="road-conditions-graph">
      {data && (
        <Line ref={ref} data={data} options={graphOptions} plugins={plugins} />
      )}
    </div>
  );
};

export default ConditionsGraph;
