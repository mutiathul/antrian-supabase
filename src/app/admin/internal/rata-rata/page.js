"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../../lib/supabaseClient"

import DashboardLayout from "../../../../components/layouts/DashboardLayout"
import AuthGuard from "../../../../components/guards/AuthGuard"

import { Bar } from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)

export default function RataRataPage() {

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
        created_at,
        waktu_selesai
      `)
      .eq("status", "selesai")

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
  // FILTER
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
      result = result.filter(item => {
        const d = new Date(item.created_at)
        return d.getMonth() === now.getMonth() &&
               d.getFullYear() === now.getFullYear()
      })
    }

    if (type === "tahun") {
      result = result.filter(item => {
        const d = new Date(item.created_at)
        return d.getFullYear() === now.getFullYear()
      })
    }

    setFiltered(result)
  }

  function resetFilter() {
    setFilter("all")
    setFiltered(data)
  }

  // =========================
  // PROCESS DATA
  // =========================
  const loketMap = {}

  filtered.forEach(item => {

    const loket = item.loket || "Unknown"

    const start = new Date(item.created_at)
    const end = item.waktu_selesai
      ? new Date(item.waktu_selesai)
      : new Date(item.created_at)

    const diff = (end - start) / 60000 // menit

    if (!loketMap[loket]) {
      loketMap[loket] = {
        total: 0,
        totalTime: 0,
        fastest: diff,
        slowest: diff
      }
    }

    loketMap[loket].total++
    loketMap[loket].totalTime += diff

    if (diff < loketMap[loket].fastest) {
      loketMap[loket].fastest = diff
    }

    if (diff > loketMap[loket].slowest) {
      loketMap[loket].slowest = diff
    }
  })

  const summary = Object.entries(loketMap).map(([loket, val]) => ({
    loket,
    total: val.total,
    avg: val.total ? (val.totalTime / val.total).toFixed(2) : 0,
    fastest: val.fastest.toFixed(2),
    slowest: val.slowest.toFixed(2)
  })).sort((a, b) => b.total - a.total)

  // =========================
  // CHART
  // =========================
  const barData = {
    labels: summary.map(i => i.loket),
    datasets: [
      {
        label: "Rata-rata Penyelesaian (Menit)",
        data: summary.map(i => i.avg),
        backgroundColor: "#3b82f6"
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
              Rata-rata Penyelesaian
            </h1>
            <p className="text-gray-500">
              Analisis waktu pelayanan berdasarkan loket
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
              <p>Total Pelayanan</p>
              <p className="text-xl font-bold">
                {summary.reduce((a,b)=>a+b.total,0)}
              </p>
            </div>

            <div className={card}>
              <p>Tercepat</p>
              <p className="text-xl font-bold text-green-600">
                {summary.length ? Math.min(...summary.map(i=>i.fastest)).toFixed(2) : 0} mnt
              </p>
            </div>

            <div className={card}>
              <p>Terlama</p>
              <p className="text-xl font-bold text-red-600">
                {summary.length ? Math.max(...summary.map(i=>i.slowest)).toFixed(2) : 0} mnt
              </p>
            </div>

            <div className={card}>
              <p>Rata-rata Global</p>
              <p className="text-xl font-bold text-blue-600">
                {summary.length
                  ? (summary.reduce((a,b)=>a+parseFloat(b.avg),0)/summary.length).toFixed(2)
                  : 0} mnt
              </p>
            </div>

          </div>

          {/* CHART */}
          <div className={card}>
            <h2 className="font-semibold mb-3">
              Grafik Rata-rata Penyelesaian per Loket
            </h2>

            <Bar data={barData} />
          </div>

          {/* TABLE */}
          <div className={card}>
            <h2 className="font-semibold mb-3">
              Detail Data Loket
            </h2>

            <div className="overflow-x-auto">

              <table className="w-full border text-sm">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">No</th>
                    <th className="p-3 text-left">Loket</th>
                    <th className="p-3 text-left">Total</th>
                    <th className="p-3 text-left">Rata-rata</th>
                    <th className="p-3 text-left">Tercepat</th>
                    <th className="p-3 text-left">Terlama</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center p-6">
                        Loading...
                      </td>
                    </tr>
                  ) : summary.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-6">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    summary.map((item, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">

                        <td className="p-3">{i + 1}</td>
                        <td className="p-3 font-medium">{item.loket}</td>
                        <td className="p-3">{item.total}</td>
                        <td className="p-3 text-blue-600 font-semibold">
                          {item.avg} menit
                        </td>
                        <td className="p-3 text-green-600">
                          {item.fastest} mnt
                        </td>
                        <td className="p-3 text-red-600">
                          {item.slowest} mnt
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )
}