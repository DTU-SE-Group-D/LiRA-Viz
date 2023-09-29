// import { FC, useEffect, useMemo, useRef } from 'react';
// import {
//   ActiveElement,
//   CategoryScale,
//   Chart,
//   ChartData,
//   ChartEvent,
//   ChartOptions,
//   ChartTypeRegistry,
//   Legend,
//   LinearScale,
//   LineElement,
//   Plugin,
//   PointElement,
//   Title,
//   Tooltip,
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';
//
// import { ConditionType } from '../../models/graph';
//
// Chart.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// );
//
// const options = ({ name, min, max }: ConditionType): ChartOptions<'line'> => ({
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       position: 'top' as const,
//       labels: { color: 'white' },
//     },
//   },
//   scales: {
//     x: {
//       title: {
//         display: true,
//         text: 'distance (m)',
//       },
//       ticks: {
//         maxTicksLimit: 30,
//         stepSize: 200,
//         callback: (tick: string | number) =>
//           Math.round(parseFloat(tick.toString())),
//       },
//     },
//     y: {
//       title: {
//         display: true,
//         text: name,
//       },
//       min: min,
//       max: max,
//     },
//   },
// });
//
// interface Props {
//   type: ConditionType;
//   data: ChartData<'line', number[], number> | undefined;
// }
//
// const ConditionsGraph: FC<Props> = ({ type, data }) => {
//   const ref = useRef<Chart<'line', number[], number>>(null);
//
//   useEffect(() => {
//     if (ref.current === null) return;
//     const chart = ref.current;
//     chart.update();
//   }, [ref, data]);
//
//   // attach events to the graph options
//   const graphOptions: ChartOptions<'line'> = useMemo(
//     () => ({
//       ...options(type),
//       onClick: (
//         event: ChartEvent,
//         elts: ActiveElement[],
//         _chart: Chart<keyof ChartTypeRegistry, number[], unknown>,
//       ) => {
//         if (elts.length === 0) return;
//         const elt = elts[0]; // doesnt work if multiple datasets
//         const pointIndex = elt.index;
//         console.log(pointIndex, event, elts);
//       },
//     }),
//     [],
//   );
//
//   const plugins: Plugin<'line'>[] = [
//     {
//       id: 'id',
//     },
//   ];
//
//   return (
//     <div className="road-conditions-graph">
//       {data && (
//         <Line ref={ref} data={data} options={graphOptions} plugins={plugins} />
//       )}
//     </div>
//   );
// };
//
// export default ConditionsGraph;
//

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const dummyData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Sample Line Chart',
      data: [12, 19, 3, 5, 2, 3, 10],
      fill: false,
      backgroundColor: 'rgba(75,192,192,0.2)',
      borderColor: 'rgba(75,192,192,1)',
    },
  ],
};

function ConditionsGraph() {
  return (
    <div>
      <h1>MARCO WAS HERE</h1>
      <h1>Line Chart Example</h1>
      <Line data={dummyData} />
    </div>
  );
}

export default ConditionsGraph;
