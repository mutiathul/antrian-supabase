"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../../lib/supabaseClient"

import DashboardLayout from "../../../../components/layouts/DashboardLayout"
import AuthGuard from "../../../../components/guards/AuthGuard"

import {
  Bar,
  Doughnut,
  Pie,
  Line
} from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

export default function RekapanByAddressPage() {

  const [raw, setRaw] = useState([])
  const [kecamatanData, setKecamatanData] = useState([])
  const [nagariData, setNagariData] = useState([])
  const [pelayananData, setPelayananData] = useState([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    getData()
  }, [])

  async function getData() {

    setLoading(true)

    // 🔥 QUERY BENAR (WAJIB JOIN LAYANAN)
    const { data, error } = await supabase
      .from("antrians")
      .select(`
        id,
        alamat,
        layanan:layanan_id (
          nama_layanan
        )
      `)

    console.log("SUPABASE DATA:", data)
    console.log("ERROR:", error)

    if (error || !data) {
      setLoading(false)
      return
    }

    // 🔥 PARSE DATA
    const cleaned = data.map(item => {

      const alamat = item.alamat || ""
      const lines = alamat.split("\n")

      const kecamatan =
        lines[0]?.replace("Kecamatan ", "").trim() || "-"

      const nagari =
        lines[1]?.replace("Nagari ", "").trim() || "-"

      const jorong =
        lines[2]?.replace("Jorong ", "").trim() || "-"

      return {
        kecamatan,
        nagari,
        jorong,
        layanan: item.layanan?.nama_layanan || "-"
      }
    })

    setRaw(cleaned)

    // 🔥 GROUPING CHART
    const kec = {}
    const nag = {}
    const lay = {}

    cleaned.forEach(item => {

      kec[item.kecamatan] = (kec[item.kecamatan] || 0) + 1
      nag[item.nagari] = (nag[item.nagari] || 0) + 1
      lay[item.layanan] = (lay[item.layanan] || 0) + 1
    })

    setKecamatanData(Object.entries(kec).map(([nama, total]) => ({ nama, total })))
    setNagariData(Object.entries(nag).map(([nama, total]) => ({ nama, total })))
    setPelayananData(Object.entries(lay).map(([nama, total]) => ({ nama, total })))

    setLoading(false)
  }

  const card = "bg-white rounded-2xl shadow-sm border border-gray-100 p-5"

  const totalPage = Math.ceil(raw.length / pageSize)

  const paginatedData = raw.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  return (
    <AuthGuard allowedRole="admin">

      <DashboardLayout role="admin">

        <div className="space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Rekapan
            </h1>
            <p className="text-gray-500 text-sm">
              Statistik wilayah dan layanan
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">

            <div className={card}>
              <p className="text-gray-500 text-sm">Total Data</p>
              <p className="text-2xl font-bold">{raw.length}</p>
            </div>

            <div className={card}>
              <p className="text-gray-500 text-sm">Kecamatan</p>
              <p className="text-2xl font-bold">{kecamatanData.length}</p>
            </div>

            <div className={card}>
              <p className="text-gray-500 text-sm">Layanan</p>
              <p className="text-2xl font-bold">{pelayananData.length}</p>
            </div>

          </div>

          {/* CHART GRID */}
          <div className="grid md:grid-cols-3 gap-6">

            <div className={card}>
              <h2 className="font-semibold mb-3">Kecamatan</h2>
              <Doughnut
                data={{
                  labels: kecamatanData.map(i => i.nama),
                  datasets: [{
                    data: kecamatanData.map(i => i.total),
                    backgroundColor: ["#22c55e","#3b82f6","#f59e0b","#a855f7","#ef4444"]
                  }]
                }}
              />
            </div>

            <div className={card}>
              <h2 className="font-semibold mb-3">Nagari</h2>
              <Pie
                data={{
                  labels: nagariData.map(i => i.nama),
                  datasets: [{
                    data: nagariData.map(i => i.total),
                    backgroundColor: ["#6366f1","#22c55e","#f97316","#eab308","#ec4899"]
                  }]
                }}
              />
            </div>

            <div className={card}>
              <h2 className="font-semibold mb-3">Layanan</h2>
              <Bar
                data={{
                  labels: pelayananData.map(i => i.nama),
                  datasets: [{
                    data: pelayananData.map(i => i.total),
                    backgroundColor: "#3b82f6"
                  }]
                }}
                options={{ indexAxis: "y" }}
              />
            </div>

          </div>

          {/* TABLE */}
          <div className={card}>

            <div className="flex justify-between mb-3">
              <h2 className="font-semibold">Data Antrian</h2>
              <span className="text-sm text-gray-500">
                Page {page} / {totalPage}
              </span>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Kecamatan</th>
                    <th className="p-3 text-left">Nagari</th>
                    <th className="p-3 text-left">Jorong</th>
                    <th className="p-3 text-left">Layanan</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">

                        <td className="p-3">{item.kecamatan}</td>
                        <td className="p-3">{item.nagari}</td>
                        <td className="p-3">{item.jorong}</td>

                        <td className="p-3">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                            {item.layanan}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}
            <div className="flex justify-between mt-4">

              <button
                className="px-3 py-1 bg-gray-100 rounded"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </button>

              <button
                className="px-3 py-1 bg-gray-100 rounded"
                disabled={page === totalPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>

            </div>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )
}