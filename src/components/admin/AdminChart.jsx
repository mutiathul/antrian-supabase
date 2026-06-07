"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"

import { Bar } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminChart({
  title,
  labels,
  data
}) {

  // ================= SAFETY CHECK =================
  const datasets = Array.isArray(data)
    ? data
    : []

  return (
    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-bold mb-5">
        {title}
      </h2>

      <Bar
        data={{
          labels,

          datasets: datasets.length > 0
            ? datasets
            : [
                {
                  label: "Data",
                  data: [],
                  backgroundColor: "#3b82f6"
                }
              ]
        }}

        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top"
            },
            title: {
              display: false
            }
          },

          // 🔥 INI YANG BIKIN BAR TIDAK NUMPUK RUSAK
          scales: {
            x: {
              stacked: false
            },
            y: {
              stacked: false,
              beginAtZero: true
            }
          }
        }}
      />

    </div>
  )
}