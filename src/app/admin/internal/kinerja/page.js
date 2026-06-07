"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../../lib/supabaseClient"

import DashboardLayout from "../../../../components/layouts/DashboardLayout"
import AuthGuard from "../../../../components/guards/AuthGuard"

import {
  Line,
  Pie,
  Bar
} from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
)

export default function KinerjaPage() {

  const [data, setData] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {

    setLoading(true)

    const { data, error } = await supabase
      .from("antrians")
      .select(`
        loket,
        status,
        created_at
      `)

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    setData(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  // =========================
  // FILTER FUNCTION
  // =========================
  function applyFilter(type) {

    setFilter(type)

    const now = new Date()

    let result = [...data]

    if (type === "hari") {

      result = result.filter(item => {
        const d = new Date(item.created_at)
        return d.toDateString() === now.toDateString()
      })
    }

    if (type === "minggu") {

      const start = new Date(now)
      start.setDate(now.getDate() - 7)

      result = result.filter(item => {
        const d = new Date(item.created_at)
        return d >= start
      })
    }

    if (type === "bulan") {

      const month = now.getMonth()
      const year = now.getFullYear()

      result = result.filter(item => {
        const d = new Date(item.created_at)
        return d.getMonth() === month && d.getFullYear() === year
      })
    }

    if (type === "tahun") {

      const year = now.getFullYear()

      result = result.filter(item => {
        const d = new Date(item.created_at)
        return d.getFullYear() === year
      })
    }

    setFiltered(result)
  }

  function resetFilter() {
    setFilter("all")
    setFiltered(data)
  }

  // =========================
  // STATUS COUNT
  // =========================
  const statusCount = {
    menunggu: 0,
    diproses: 0,
    selesai: 0,
    dibatalkan: 0
  }

  const loketCount = {}
  const dailyCount = {}

  filtered.forEach(item => {

    const status = item.status || "menunggu"

    if (statusCount[status] !== undefined) {
      statusCount[status]++
    }

    const loket = item.loket || "Unknown"
    loketCount[loket] = (loketCount[loket] || 0) + 1

    const date = new Date(item.created_at)
      .toLocaleDateString("id-ID")

    dailyCount[date] = (dailyCount[date] || 0) + 1
  })

  const total = filtered.length

  const selesai = statusCount.selesai
  const diproses = statusCount.diproses
  const dibatalkan = statusCount.dibatalkan
  const menunggu = statusCount.menunggu

  // =========================
  // CHART DATA
  // =========================
  const lineData = {
    labels: Object.keys(dailyCount),
    datasets: [
      {
        label: "Antrian Harian",
        data: Object.values(dailyCount),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6"
      }
    ]
  }

  const pieData = {
    labels: ["Menunggu", "Diproses", "Selesai", "Dibatalkan"],
    datasets: [
      {
        data: [
          menunggu,
          diproses,
          selesai,
          dibatalkan
        ],
        backgroundColor: [
          "#f59e0b",
          "#3b82f6",
          "#22c55e",
          "#ef4444"
        ]
      }
    ]
  }

  const ranking = Object.entries(loketCount)
    .map(([loket, total]) => ({ loket, total }))
    .sort((a, b) => b.total - a.total)

  const barData = {
    labels: ranking.map(i => i.loket),
    datasets: [
      {
        label: "Total Pelayanan per Loket",
        data: ranking.map(i => i.total),
        backgroundColor: "#22c55e"
      }
    ]
  }

  const card = "bg-white p-4 rounded-xl shadow"

  return (
    <AuthGuard allowedRole="admin">

      <DashboardLayout role="admin">

        <div className="space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold">
              Grafik Kinerja Loket
            </h1>
            <p className="text-gray-500">
              Monitoring performa berdasarkan loket
            </p>
          </div>

          {/* FILTER */}
          <div className="flex flex-wrap gap-2">

            <button onClick={() => applyFilter("hari")}
              className="px-3 py-2 bg-blue-500 text-white rounded">
              Hari Ini
            </button>

            <button onClick={() => applyFilter("minggu")}
              className="px-3 py-2 bg-green-500 text-white rounded">
              Minggu Ini
            </button>

            <button onClick={() => applyFilter("bulan")}
              className="px-3 py-2 bg-purple-500 text-white rounded">
              Bulan Ini
            </button>

            <button onClick={() => applyFilter("tahun")}
              className="px-3 py-2 bg-orange-500 text-white rounded">
              Tahun Ini
            </button>

            <button onClick={resetFilter}
              className="px-3 py-2 bg-gray-500 text-white rounded">
              Reset
            </button>

          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className={card}>
              <p>Total</p>
              <p className="text-xl font-bold">{total}</p>
            </div>

            <div className={card}>
              <p>Selesai</p>
              <p className="text-xl font-bold text-green-600">{selesai}</p>
            </div>

            <div className={card}>
              <p>Diproses</p>
              <p className="text-xl font-bold text-blue-600">{diproses}</p>
            </div>

            <div className={card}>
              <p>Dibatalkan</p>
              <p className="text-xl font-bold text-red-600">{dibatalkan}</p>
            </div>

          </div>

          {/* CHART */}
          <div className="grid md:grid-cols-2 gap-6">

            <div className={card}>
              <h2 className="font-semibold mb-3">
                Tren Harian
              </h2>
              <Line data={lineData} />
            </div>

            <div className={card}>
              <h2 className="font-semibold mb-3">
                Status Antrian
              </h2>
              <Pie data={pieData} />
            </div>

          </div>

          {/* BAR LOKET */}
          <div className={card}>
            <h2 className="font-semibold mb-3">
              Kinerja Loket
            </h2>

            <Bar
              data={barData}
              options={{
                indexAxis: "y"
              }}
            />
          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>

  )
}