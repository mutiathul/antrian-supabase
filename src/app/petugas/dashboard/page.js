"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function PetugasDashboard() {

  const [total, setTotal] = useState(0)

  const [menunggu, setMenunggu] = useState(0)

  const [dipanggil, setDipanggil] = useState(0)

  const [diterima, setDiterima] = useState(0)

  const [ditolak, setDitolak] = useState(0)

  useEffect(() => {

    getData()

  }, [])

  async function getData(){

    const { data, error } = await supabase
      .from("antrians")
      .select("*")

    if(error){

      alert(error.message)
      return
    }

    setTotal(data.length)

    setMenunggu(
      data.filter(
        (x)=>x.status === "menunggu"
      ).length
    )

    setDipanggil(
      data.filter(
        (x)=>x.status === "dipanggil"
      ).length
    )

    setDiterima(
      data.filter(
        (x)=>x.status === "diterima"
      ).length
    )

    setDitolak(
      data.filter(
        (x)=>x.status === "ditolak"
      ).length
    )
  }

  return (

    <AuthGuard allowedRole="petugas">

      <DashboardLayout role="petugas">

        <h1 className="text-3xl font-bold mb-6">

          Dashboard Petugas

        </h1>

        {/* CARD */}

        <div className="grid md:grid-cols-5 gap-5">

          {/* TOTAL */}

          <div className="bg-white p-5 rounded-lg shadow">

            <p className="text-gray-500">
              Total
            </p>

            <h1 className="text-4xl font-bold">

              {total}

            </h1>

          </div>

          {/* MENUNGGU */}

          <div className="bg-yellow-500 text-white p-5 rounded-lg shadow">

            <p>
              Menunggu
            </p>

            <h1 className="text-4xl font-bold">

              {menunggu}

            </h1>

          </div>

          {/* DIPANGGIL */}

          <div className="bg-blue-500 text-white p-5 rounded-lg shadow">

            <p>
              Dipanggil
            </p>

            <h1 className="text-4xl font-bold">

              {dipanggil}

            </h1>

          </div>

          {/* DITERIMA */}

          <div className="bg-green-500 text-white p-5 rounded-lg shadow">

            <p>
              Diterima
            </p>

            <h1 className="text-4xl font-bold">

              {diterima}

            </h1>

          </div>

          {/* DITOLAK */}

          <div className="bg-red-500 text-white p-5 rounded-lg shadow">

            <p>
              Ditolak
            </p>

            <h1 className="text-4xl font-bold">

              {ditolak}

            </h1>

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-white p-5 rounded-lg shadow mt-8">

          <h1 className="text-2xl font-bold mb-5">

            Antrian Terbaru

          </h1>

          <div className="overflow-x-auto">

            <table className="w-full border">

              <thead className="bg-gray-100">

                <tr>

                  <th className="border p-3">
                    Nomor
                  </th>

                  <th className="border p-3">
                    Nama
                  </th>

                  <th className="border p-3">
                    Layanan
                  </th>

                  <th className="border p-3">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  total > 0 ? (

                    dataTerbaru()

                  ) : (

                    <tr>

                      <td
                        colSpan="4"
                        className="text-center p-5"
                      >
                        Belum ada antrian
                      </td>

                    </tr>

                  )
                }

              </tbody>

            </table>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )

  function dataTerbaru(){

    return null
  }
}