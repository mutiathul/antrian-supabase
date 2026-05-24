"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function RiwayatPage() {

  const [antrians, setAntrians] = useState([])

  useEffect(() => {

    getRiwayat()

    const interval = setInterval(() => {

      getRiwayat()

    }, 3000)

    return () => clearInterval(interval)

  }, [])

  async function getRiwayat() {

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) return

    const { data } = await supabase
      .from("antrians")
      .select(`
        *,
        layanans (
          nama_layanan,
          kode_layanan
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    setAntrians(data || [])
  }

  function getBadge(status) {

    if (status === "menunggu") {
      return "bg-yellow-500"
    }

    if (status === "dipanggil") {
      return "bg-blue-500"
    }

    if (status === "diterima") {
      return "bg-green-500"
    }

    if (status === "ditolak") {
      return "bg-red-500"
    }

    return "bg-gray-500"
  }

  return (

    <AuthGuard allowedRole="masyarakat">

      <DashboardLayout role="masyarakat">

        <div className="bg-white p-5 rounded-lg shadow">

          <h1 className="text-2xl font-bold mb-5">
            Riwayat Antrian
          </h1>

          <div className="overflow-x-auto">

            <table className="w-full border">

              <thead className="bg-gray-100">

                <tr>

                  <th className="p-3 border">
                    Nomor
                  </th>

                  <th className="p-3 border">
                    Layanan
                  </th>

                  <th className="p-3 border">
                    Status
                  </th>

                  <th className="p-3 border">
                    Tanggal
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  antrians.map((item)=>(
                    <tr
                      key={item.id}
                    >

                      <td className="p-3 border font-bold">

                        {item.nomor_antrian}

                      </td>

                      <td className="p-3 border">

                        {item.layanans?.nama_layanan}

                      </td>

                      <td className="p-3 border">

                        <span
                          className={`
                            ${getBadge(item.status)}
                            text-white
                            px-3
                            py-1
                            rounded-full
                            text-sm
                          `}
                        >

                          {item.status}

                        </span>

                      </td>

                      <td className="p-3 border">

                        {
                          new Date(
                            item.created_at
                          ).toLocaleString()
                        }

                      </td>

                    </tr>
                  ))
                }

              </tbody>

            </table>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )
}