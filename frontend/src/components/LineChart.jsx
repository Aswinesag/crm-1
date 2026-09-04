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
import { Line } from 'react-chartjs-2';
import React from 'react';
  
// Register necessary components for Line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  
const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'leads',
        data: [0,5,0,0,0,0],
        fill: false,
        borderColor: '#ff7e00',
        backgroundColor: '#ff7e00',
        tension: 0.4, // for curved line
      },
    ],
};
  
const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    
    },
    scales: {
      y: {
        min: 0,
        max: 8,
        ticks: {
          stepSize: 2,
          color: '#333',
        },
        grid: {
          color: '#eee',
          borderDash: [4, 4],
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: '#333',
        },
        grid: {
          color: '#eee',
          borderDash: [4, 4],
          drawBorder: false,
        },
      },
    },
};
  
const LineChart = () => {
    return (
      <div style={{ width: '600px', height: '480px' }}>
        <Line data={data} options={options} className='p-5'/>
      </div>
    );
};
  
export default LineChart;