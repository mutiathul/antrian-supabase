"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function AdminDashboard() {

  const [total, setTotal] = useState(0)

  const [diterima, setDiterima] = useState(0)

  const [ditolak, setDitolak] = useState(0)

  const [menunggu, setMenunggu] = useState(0)

  useEffect(() => {

    getData()

  }, [])

  async function getData() {

    const { data } = await supabase
      .from("antrians")
      .select("*")

    setTotal(data?.length || 0)

    setDiterima(
      data?.filter(
        (x)=>x.status === "diterima"
      ).length || 0
    )

    setDitolak(
      data?.filter(
        (x)=>x.status === "ditolak"
      ).length || 0
    )

    setMenunggu(
      data?.filter(
        (x)=>x.status === "menunggu"
      ).length || 0
    )
  }

  return (

    <AuthGuard allowedRole="admin">

      <DashboardLayout role="admin">

        <h1 className="text-3xl font-bold mb-6">
          Dashboard Admin
        </h1>

        <div className="grid md:grid-cols-4 gap-5">

          <div className="bg-white p-5 rounded-lg shadow">

            <p className="text-gray-500">
              Total Antrian
            </p>

            <h1 className="text-4xl font-bold">

              {total}

            </h1>

          </div>

          <div className="bg-green-500 text-white p-5 rounded-lg shadow">

            <p>
              Diterima
            </p>

            <h1 className="text-4xl font-bold">

              {diterima}

            </h1>

          </div>

          <div className="bg-red-500 text-white p-5 rounded-lg shadow">

            <p>
              Ditolak
            </p>

            <h1 className="text-4xl font-bold">

              {ditolak}

            </h1>

          </div>

          <div className="bg-yellow-500 text-white p-5 rounded-lg shadow">

            <p>
              Menunggu
            </p>

            <h1 className="text-4xl font-bold">

              {menunggu}

            </h1>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )
}