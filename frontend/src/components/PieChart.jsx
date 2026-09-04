
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import React from 'react';
  
// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);
  
const data = {
    labels: ['Facebook', 'Email', 'Website', 'Instagram', 'Other'],
    datasets: [
      {
        label: 'Opportunities',
        data: [10, 15, 10, 20, 30],
        backgroundColor: [
          '#FF7E00',   // Facebook
          '#FFB347',   // Email
          '#FFE29A',   // Website
          '#FFCBA4',   // Instagram
          '#E3E3E3'    // Other
        ],
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
};
  
const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    spacing:10, // Creates the donut "hole"
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          boxWidth: 20,
          padding: 15,
          font: {
            size: 14,
            family: 'Arial',
          },
        },
      },
      title: {
        display: true,
       
        color: '#333',
        padding: {
          top: 10,
          bottom: 20,
        },
        font: {
          size: 18,
          family: 'Arial',
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${tooltipItem.raw} opportunities`,
        },
      },
    },
};
  
const PieChart = () => {
    return (
      <div style={{ width: '400px', height: '480px', margin: '0 auto' }}>
        <Doughnut data={data} options={options} />
      </div>
    );
};
  
export default PieChart;
  