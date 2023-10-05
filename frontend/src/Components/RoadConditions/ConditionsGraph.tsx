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
//const colorCode = '#1478BD';

// const dummyData = {
//   data: {
//     labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
//     datasets: [
//       {
//         backgroundColor: colorCode,
//         borderColor: colorCode,
//         borderWidth: 2,
//         data: [65, 59, 80, 81, 56, 65, 59, 80, 81, 56, 40, 56],
//       },
//     ],
//   },
//   options: {
//     plugins: {
//       legend: {
//         display: true,
//         label: 'data',
//       },
//     },
//     scales: {
//       x: {
//         grid: {
//           display: false,
//         },
//         beginAtZero: false,
//         ticks: {
//           color: colorCode,
//         },
//       },
//       y: {
//         grid: {
//           display: false,
//         },
//         beginAtZero: true,
//         ticks: {
//           color: colorCode,
//         },
//       },
//     },
//   },
// };

const options = ({
  name,
  min,
  max,
}: ConditionType): ChartOptions<'scatter'> => ({
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
  data: ChartData<'scatter', number[], number> | undefined;
}

const ConditionsGraph: FC<Props> = ({ type, data }) => {
  const ref = useRef<Chart<'scatter', number[], number>>(null);

  useEffect(() => {
    if (ref.current === null) return;
    const chart = ref.current;
    chart.update();
  }, [ref, data]);

  // attach events to the graph options
  const graphOptions: ChartOptions<'scatter'> = useMemo(
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
