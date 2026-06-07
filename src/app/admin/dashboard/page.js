"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"
import AuthGuard from "../../../components/guards/AuthGuard"

import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
)
export default function DashboardAdminPage() {

  const [data, setData] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)

    const { data, error } = await supabase
      .from("antrians")
      .select(`
        id,
        loket,
        created_at,
        waktu_mulai_proses,
        waktu_selesai,
        status,
        jenis_kelamin,
        kecamatan,
        nagari,
        layanans (nama_layanan)
      `)
      .eq("status", "selesai")

    if (error) { console.log(error); setLoading(false); return }

    const cleaned = (data || []).map(item => {
      const start = new Date(item.waktu_mulai_proses || item.created_at)
      const end = new Date(item.waktu_selesai || item.created_at)
      const diff = (end - start) / 60000

      return {
        layanan: item.layanans?.nama_layanan || "Unknown",
        loket: item.loket || "Unknown",
        waktu: diff < 0 ? 0 : diff,
        created_at: item.created_at,
        jenis_kelamin: item.jenis_kelamin || "Unknown",
        kecamatan: item.kecamatan || "Unknown",
        nagari: item.nagari || "Unknown"
      }
    })

    setData(cleaned)
    setFiltered(cleaned)
    setLoading(false)
  }
  function applyFilter(type) {
    setFilter(type)
    const now = new Date()
    let result = [...data]

    if (type === "hari") {
      result = result.filter(i => new Date(i.created_at).toDateString() === now.toDateString())
    }
    if (type === "minggu") {
      const start = new Date(); start.setDate(now.getDate() - 7)
      result = result.filter(i => new Date(i.created_at) >= start)
    }
    if (type === "bulan") {
      result = result.filter(i => {
        const d = new Date(i.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    }
    if (type === "tahun") {
      result = result.filter(i => new Date(i.created_at).getFullYear() === now.getFullYear())
    }

    setFiltered(result)
  }

  function resetFilter() {
    setFilter("all")
    setFiltered(data)
  }
  // Summary Layanan & Loket
  const layananMap = {}, loketMap = {}
  const genderMap = {}, kecamatanMap = {}, nagariMap = {}

  filtered.forEach(item => {
    // Layanan
    if (!layananMap[item.layanan]) {
      layananMap[item.layanan] = { total:0, sum:0, min:item.waktu, max:item.waktu }
    }
    layananMap[item.layanan].total++
    layananMap[item.layanan].sum += item.waktu
    layananMap[item.layanan].min = Math.min(layananMap[item.layanan].min, item.waktu)
    layananMap[item.layanan].max = Math.max(layananMap[item.layanan].max, item.waktu)

    // Loket
    if (!loketMap[item.loket]) { loketMap[item.loket] = { total:0, sum:0 } }
    loketMap[item.loket].total++
    loketMap[item.loket].sum += item.waktu

    // Gender
    if (!genderMap[item.jenis_kelamin]) { genderMap[item.jenis_kelamin] = { total:0 } }
    genderMap[item.jenis_kelamin].total++

    // Kecamatan
    if (!kecamatanMap[item.kecamatan]) { kecamatanMap[item.kecamatan] = { total:0 } }
    kecamatanMap[item.kecamatan].total++

    // Nagari
    if (!nagariMap[item.nagari]) { nagariMap[item.nagari] = { total:0 } }
    nagariMap[item.nagari].total++
  })

  // Convert Map to Array
  const layananSummary = Object.entries(layananMap).map(([nama,v])=>({
    nama, total:v.total, avg:v.sum/v.total, min:v.min, max:v.max
  })).sort((a,b)=>b.total-a.total)

  const loketSummary = Object.entries(loketMap).map(([loket,v])=>({
    loket, total:v.total, avg:v.sum/v.total
  })).sort((a,b)=>b.total-a.total)

  const genderSummary = Object.entries(genderMap).map(([nama,v])=>({ nama, total:v.total }))
  const kecamatanSummary = Object.entries(kecamatanMap).map(([nama,v])=>({ nama, total:v.total }))
  const nagariSummary = Object.entries(nagariMap).map(([nama,v])=>({ nama, total:v.total }))

  // KPI
  const totalPelayanan = filtered.length
  const avgGlobal = layananSummary.length ? layananSummary.reduce((a,b)=>a+b.avg,0)/layananSummary.length : 0
  const fastest = layananSummary.length ? Math.min(...layananSummary.map(i=>i.min)) : 0
  const slowest = layananSummary.length ? Math.max(...layananSummary.map(i=>i.max)) : 0
  const card = "bg-white p-5 rounded-xl shadow"

  // =========================
  // CHART DATA
  // =========================

  const chartLayanan = {
    labels: layananSummary.map(i => i.nama),
    datasets: [
      {
        label: "Rata-rata (Menit)",
        data: layananSummary.map(i => i.avg),
        backgroundColor: "#3b82f6"
      }
    ]
  }

  const chartLoket = {
    labels: loketSummary.map(i => i.loket),
    datasets: [
      {
        label: "Total Pelayanan",
        data: loketSummary.map(i => i.total),
        backgroundColor: "#f59e0b"
      }
    ]
  }

  const chartGender = {
    labels: genderSummary.map(i => i.nama),
    datasets: [
      {
        label: "Jenis Kelamin",
        data: genderSummary.map(i => i.total),
        backgroundColor: ["#3b82f6", "#f472b6", "#9ca3af"]
      }
    ]
  }

  const chartKecamatan = {
    labels: kecamatanSummary.map(i => i.nama),
    datasets: [
      {
        label: "Total Kecamatan",
        data: kecamatanSummary.map(i => i.total),
        backgroundColor: "#8b5cf6"
      }
    ]
  }

  const chartNagari = {
    labels: nagariSummary.map(i => i.nama),
    datasets: [
      {
        label: "Total Nagari",
        data: nagariSummary.map(i => i.total),
        backgroundColor: "#10b981"
      }
    ]
  }

  const chartTren = {
    labels: filtered.map(i =>
      new Date(i.created_at).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Waktu Proses (mnt)",
        data: filtered.map(i => i.waktu),
        borderColor: "#10b981",
        backgroundColor: "#10b981"
      }
    ]
  }
  return (
    <AuthGuard allowedRole="admin">
      <DashboardLayout role="admin">

        <div className="space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard Admin Level 2
            </h1>
            <p className="text-gray-500">
              Monitoring lengkap pelayanan Disdukcapil
            </p>
          </div>

          {/* FILTER */}
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>applyFilter("hari")} className="px-3 py-2 bg-blue-500 text-white rounded">Hari</button>
            <button onClick={()=>applyFilter("minggu")} className="px-3 py-2 bg-green-500 text-white rounded">Minggu</button>
            <button onClick={()=>applyFilter("bulan")} className="px-3 py-2 bg-purple-500 text-white rounded">Bulan</button>
            <button onClick={()=>applyFilter("tahun")} className="px-3 py-2 bg-orange-500 text-white rounded">Tahun</button>
            <button onClick={resetFilter} className="px-3 py-2 bg-gray-500 text-white rounded">Reset</button>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className={card}>
              <p>Total Pelayanan</p>
              <p className="text-2xl font-bold">{totalPelayanan}</p>
            </div>

            <div className={card}>
              <p>Tercepat</p>
              <p className="text-2xl font-bold text-green-600">
                {fastest.toFixed(2)} mnt
              </p>
            </div>

            <div className={card}>
              <p>Terlama</p>
              <p className="text-2xl font-bold text-red-600">
                {slowest.toFixed(2)} mnt
              </p>
            </div>

            <div className={card}>
              <p>Rata-rata Global</p>
              <p className="text-2xl font-bold text-blue-600">
                {avgGlobal.toFixed(2)} mnt
              </p>
            </div>

          </div>

          {/* CHART GRID 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className={card}>
              <h2 className="font-semibold mb-3">Layanan Terbanyak</h2>
              <Bar data={chartLayanan} />
            </div>

            <div className={card}>
              <h2 className="font-semibold mb-3">Total per Loket</h2>
              <Bar data={chartLoket} />
            </div>

          </div>

          {/* CHART GRID 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className={card}>
              <h2 className="font-semibold mb-3">Jenis Kelamin</h2>
              <Pie data={chartGender} />
            </div>

            <div className={card}>
              <h2 className="font-semibold mb-3">Kecamatan</h2>
              <Bar data={chartKecamatan} />
            </div>

            <div className={card}>
              <h2 className="font-semibold mb-3">Nagari</h2>
              <Bar data={chartNagari} />
            </div>

          </div>

          {/* TREND */}
          <div className={card}>
            <h2 className="font-semibold mb-3">Tren Pelayanan</h2>
            <Line data={chartTren} />
          </div>

          {/* TABLE */}
          <div className={card}>
            <h2 className="font-semibold mb-3">Detail Layanan</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Layanan</th>
                    <th className="p-3 text-left">Jumlah</th>
                    <th className="p-3 text-left">Rata-rata</th>
                    <th className="p-3 text-left">Tercepat</th>
                    <th className="p-3 text-left">Terlama</th>
                  </tr>
                </thead>

                <tbody>
                  {layananSummary.map((i, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3">{i.nama}</td>
                      <td className="p-3">{i.total}</td>
                      <td className="p-3 text-blue-600">{i.avg.toFixed(2)}</td>
                      <td className="p-3 text-green-600">{i.min.toFixed(2)}</td>
                      <td className="p-3 text-red-600">{i.max.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

        </div>

      </DashboardLayout>
    </AuthGuard>
  )
}