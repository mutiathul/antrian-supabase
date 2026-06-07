"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../../lib/supabaseClient"

import DashboardLayout from "../../../../components/layouts/DashboardLayout"
import AuthGuard from "../../../../components/guards/AuthGuard"

import {
  Bar
} from "react-chartjs-2"

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

export default function ProduktivitasPage() {

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
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
        id,
        created_at,
        status,
        layanans (
          nama_layanan
        )
      `)

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    const cleaned = data.map(item => ({
      layanan: item.layanans?.nama_layanan || "Tidak Diketahui",
      status: item.status,
      created_at: item.created_at
    }))

    setData(cleaned)
    setFilteredData(cleaned)
    setLoading(false)
  }

  function applyFilter(type) {

    setFilter(type)

    if (type === "all") {
      setFilteredData(data)
      return
    }

    const now = new Date()

    const filtered = data.filter(item => {

      const date = new Date(item.created_at)

      if (type === "day") {
        return date.toDateString() === now.toDateString()
      }

      if (type === "month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )
      }

      if (type === "year") {
        return date.getFullYear() === now.getFullYear()
      }

      return true
    })

    setFilteredData(filtered)
  }

  // GROUPING
  const grouped = {}

  filteredData.forEach(item => {
    grouped[item.layanan] = (grouped[item.layanan] || 0) + 1
  })

  const chartData = {
    labels: Object.keys(grouped),
    datasets: [
      {
        label: "Jumlah Pengguna",
        data: Object.values(grouped),
        backgroundColor: "#3b82f6"
      }
    ]
  }

  const sorted = Object.entries(grouped)
    .map(([nama, total]) => ({
      nama,
      total
    }))
    .sort((a, b) => b.total - a.total)

  const totalAntrian = filteredData.length

  const layananAktif = Object.keys(grouped).length

  const terlaris = sorted[0]?.nama || "-"

  const terendah = sorted[sorted.length - 1]?.nama || "-"

  return (

    <AuthGuard allowedRole="admin">

      <DashboardLayout role="admin">

        <div className="space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold">
              Produktivitas Layanan
            </h1>

            <p className="text-gray-500">
              Analisis jumlah penggunaan setiap layanan
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500 text-sm">Total Antrian</p>
              <p className="text-xl font-bold">{totalAntrian}</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500 text-sm">Layanan Aktif</p>
              <p className="text-xl font-bold">{layananAktif}</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500 text-sm">Layanan Terlaris</p>
              <p className="text-xl font-bold">{terlaris}</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500 text-sm">Layanan Terendah</p>
              <p className="text-xl font-bold">{terendah}</p>
            </div>

          </div>

          {/* FILTER */}
          <div className="flex flex-wrap gap-3">

            <button onClick={() => applyFilter("day")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Per Hari
            </button>

            <button onClick={() => applyFilter("month")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg">
              Per Bulan
            </button>

            <button onClick={() => applyFilter("year")}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg">
              Per Tahun
            </button>

            <button onClick={() => applyFilter("all")}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg">
              Reset
            </button>

          </div>

          {/* CHART */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-4">
              Grafik Produktivitas Layanan
            </h2>

            <Bar
              data={chartData}
              options={{
                indexAxis: "y",
                responsive: true
              }}
            />
          </div>

          {/* TABLE */}
          <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">No</th>
                  <th className="p-3 text-left">Nama Layanan</th>
                  <th className="p-3 text-left">Total Pengguna</th>
                  <th className="p-3 text-left">Persentase</th>
                </tr>
              </thead>

              <tbody>

                {sorted.map((item, i) => (
                  <tr key={i} className="border-b">

                    <td className="p-3">{i + 1}</td>

                    <td className="p-3">{item.nama}</td>

                    <td className="p-3 font-bold">{item.total}</td>

                    <td className="p-3">
                      {((item.total / totalAntrian) * 100).toFixed(1)}%
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>

  )
}