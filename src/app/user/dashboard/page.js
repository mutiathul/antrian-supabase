"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function UserDashboard() {

  const [antrian, setAntrian] = useState(null)

  const [sisa, setSisa] = useState(0)

  useEffect(() => {

    getAntrian()

    const interval = setInterval(() => {

      getAntrian()

    }, 3000)

    return () => clearInterval(interval)

  }, [])

  async function getAntrian() {

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) return

    const { data } = await supabase
      .from("antrians")
      .select(`
        *,
        layanans (
          nama_layanan
        )
      `)
      .eq("user_id", session.user.id)
      .in("status", ["menunggu", "dipanggil"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!data) {

      setAntrian(null)
      return
    }

    setAntrian(data)

    // hitung sisa antrian
    const { data: waiting } = await supabase
      .from("antrians")
      .select("*")
      .eq("layanan_id", data.layanan_id)
      .eq("status", "menunggu")

    const posisi = waiting.findIndex(
      (x)=>x.id === data.id
    )

    setSisa(posisi)
  }

  function getBadge(status){

    if(status === "menunggu"){
      return "bg-yellow-500"
    }

    if(status === "dipanggil"){
      return "bg-blue-500"
    }

    return "bg-gray-500"
  }

  return (

    <AuthGuard allowedRole="masyarakat">

      <DashboardLayout role="masyarakat">

        <h1 className="text-3xl font-bold mb-5">
          Dashboard Masyarakat
        </h1>

        {
          antrian ? (

            <div className="bg-white p-6 rounded-lg shadow max-w-xl">

              <h2 className="text-xl font-bold mb-5">
                Antrian Aktif
              </h2>

              <div className="space-y-3">

                <div>

                  <p className="text-gray-500">
                    Nomor Antrian
                  </p>

                  <h1 className="text-4xl font-bold text-blue-700">

                    {antrian.nomor_antrian}

                  </h1>

                </div>

                <div>

                  <p className="text-gray-500">
                    Layanan
                  </p>

                  <p className="font-semibold">

                    {antrian.layanans?.nama_layanan}

                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Status
                  </p>

                  <span
                    className={`
                      ${getBadge(antrian.status)}
                      text-white
                      px-4
                      py-2
                      rounded-full
                    `}
                  >

                    {antrian.status}

                  </span>

                </div>

                <div>

                  <p className="text-gray-500">
                    Sisa Antrian
                  </p>

                  <p className="font-bold text-lg">

                    {sisa} antrian lagi

                  </p>

                </div>

              </div>

            </div>

          ) : (

            <div className="bg-white p-6 rounded shadow">

              <p>
                Belum ada antrian aktif
              </p>

            </div>

          )
        }

      </DashboardLayout>

    </AuthGuard>
  )
}