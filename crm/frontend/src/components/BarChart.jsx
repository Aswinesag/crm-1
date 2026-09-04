import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; 
import React from 'react';
  
// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
  
const data = {
    labels: ['Jan', 'Feb', 'Mar','Apr','May','Jun','July','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      {
        label: 'Opportunities',
        data: [2, 0.5, 0],
        backgroundColor: ['#ff7e00 '],
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
        max: 2,
        ticks: {
          stepSize: 0.5,
          color: '#333',
        },
        grid: {
            drawBorder: false,
          color: '#dcdcdc ',
          borderDash: [3, 3], // lighter grid lines
        },
      },
      x: {
        ticks: {
          color: '#333',
        },
        grid: {
            drawBorder: false,
          color: '#dcdcdc ',
          borderDash: [3,3], // Dashed lines for X-axis
        },
      },
    },
};
  
  
const BarChart = () => {
    return (
        <div style={{width:"600px",height:"480px",border:"none",padding:0,margin:0}}>
            <Bar data={data} options={options} className='p-5'/>;
        </div>
    )
};
  
export default BarChart;
  