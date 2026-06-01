"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import DashboardLayout from "../../../components/layouts/DashboardLayout"
import AuthGuard from "../../../components/guards/AuthGuard"

export default function RiwayatPetugasPage() {

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)

  const [filterType, setFilterType] = useState("harian")

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  )

  const [bulan, setBulan] = useState(
    new Date().toISOString().slice(0, 7)
  )

  const [userData, setUserData] = useState(null)

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) return

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    setUserData(data)
  }

  useEffect(() => {

    if (userData?.loket) {
      getData()
    }

  }, [
    userData,
    filterType,
    tanggal,
    bulan
  ])

  async function getData() {

    setLoading(true)

    let query = supabase
      .from("antrians")
      .select(`
        id,
        created_at,
        status,
        status_dokumen,
        loket,
        nomor_antrian,
        layanans(
          nama_layanan
        )
      `)

    // =========================
    // FILTER TANGGAL
    // =========================

    if (filterType === "harian") {

      const start =
        `${tanggal}T00:00:00`

      const end =
        `${tanggal}T23:59:59`

      query = query
        .gte("created_at", start)
        .lte("created_at", end)
    }

    if (filterType === "bulanan") {

      const start =
        `${bulan}-01T00:00:00`

      const end =
        `${bulan}-31T23:59:59`

      query = query
        .gte("created_at", start)
        .lte("created_at", end)
    }

    // =========================
    // FO
    // =========================

    if (userData.loket === "FO") {

      query = query.in(
        "status_dokumen",
        [
          "lengkap",
          "ditolak"
        ]
      )

    } else {

      query = query
        .eq("loket", userData.loket)
        .eq("status", "selesai")
    }

    const {
      data,
      error
    } = await query

    if (error) {

      console.log(error)

      setLoading(false)

      return
    }

    // =========================
    // REKAP FO
    // =========================

    if (userData.loket === "FO") {

      const diterima =
        data.filter(
          item =>
            item.status_dokumen === "lengkap"
        ).length

      const ditolak =
        data.filter(
          item =>
            item.status_dokumen === "ditolak"
        ).length

      setData([
        {
          layanan: "Dokumen Diterima",
          total: diterima
        },
        {
          layanan: "Dokumen Ditolak",
          total: ditolak
        }
      ])

      setTotal(
        diterima + ditolak
      )

      setLoading(false)

      return
    }

    // =========================
    // REKAP LOKET BIASA
    // =========================

    const grouped = {}

    data.forEach((item) => {

      const layanan =
        item.layanans?.nama_layanan ||
        "Lainnya"

      if (!grouped[layanan]) {
        grouped[layanan] = 0
      }

      grouped[layanan]++
    })

    const result =
      Object.keys(grouped).map(
        key => ({
          layanan: key,
          total: grouped[key]
        })
      )

    setData(result)

    setTotal(data.length)

    setLoading(false)
  }

  return (

    <AuthGuard allowedRole="petugas">

      <DashboardLayout role="petugas">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-3xl font-bold mb-2">
            Riwayat Penyelesaian
          </h1>

          <p className="text-gray-500 mb-6">
            Loket : {userData?.loket}
          </p>

          <div className="
            bg-blue-600
            text-white
            p-6
            rounded-2xl
            mb-6
          ">
            <p>Total</p>

            <h1 className="
              text-4xl
              font-bold
            ">
              {total}
            </h1>
          </div>

          <div className="
            bg-white
            p-4
            rounded-2xl
            shadow
            mb-6
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
          ">

            <select
              className="
                border
                p-2
                rounded
              "
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value
                )
              }
            >
              <option value="harian">
                Harian
              </option>

              <option value="bulanan">
                Bulanan
              </option>

            </select>

            {
              filterType === "harian" && (

                <input
                  type="date"
                  className="
                    border
                    p-2
                    rounded
                  "
                  value={tanggal}
                  onChange={(e) =>
                    setTanggal(
                      e.target.value
                    )
                  }
                />

              )
            }

            {
              filterType === "bulanan" && (

                <input
                  type="month"
                  className="
                    border
                    p-2
                    rounded
                  "
                  value={bulan}
                  onChange={(e) =>
                    setBulan(
                      e.target.value
                    )
                  }
                />

              )
            }

          </div>

          <div className="
            bg-white
            rounded-2xl
            shadow
            overflow-hidden
          ">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="
                    p-4
                    text-left
                  ">
                    Keterangan
                  </th>

                  <th className="
                    p-4
                    text-left
                  ">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  loading ? (

                    <tr>
                      <td
                        colSpan="2"
                        className="
                          p-6
                          text-center
                        "
                      >
                        Loading...
                      </td>
                    </tr>

                  ) : data.length === 0 ? (

                    <tr>
                      <td
                        colSpan="2"
                        className="
                          p-6
                          text-center
                          text-gray-500
                        "
                      >
                        Tidak ada data
                      </td>
                    </tr>

                  ) : (

                    data.map(
                      (item, index) => (

                        <tr
                          key={index}
                          className="border-t"
                        >

                          <td className="p-4">
                            {item.layanan}
                          </td>

                          <td className="
                            p-4
                            font-bold
                            text-blue-600
                          ">
                            {item.total}
                          </td>

                        </tr>

                      )
                    )

                  )
                }

              </tbody>

            </table>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>

  )
}