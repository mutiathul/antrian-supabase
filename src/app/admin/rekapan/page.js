"use client"

import { useEffect, useState }

from "react"

import { supabase }

from "../../../../lib/supabaseClient"

import DashboardLayout

from "../../../components/layouts/DashboardLayout"

import AuthGuard

from "../../../components/guards/AuthGuard"

export default function RekapanPage(){

  const [loading,setLoading]
    = useState(true)

  const [data,setData]
    = useState([])

  const [filter,setFilter]
    = useState("harian")

  useEffect(()=>{

    loadData()

  },[filter])

  async function loadData(){

    setLoading(true)

    let query = supabase

      .from("antrians")

      .select(`
        *,
        layanans(
          nama_layanan
        )
      `)

      .eq(
        "status",
        "selesai"
      )

    const { data } =
      await query

    const grouped = {}

    data?.forEach(item=>{

      const layanan =
        item.layanans
        ?.nama_layanan
        || "Lainnya"

      if(!grouped[layanan]){

        grouped[layanan] = {

          total:0,

          durasi:0
        }
      }

      grouped[layanan].total++

      grouped[layanan].durasi +=
        Number(
          item.durasi_pelayanan_menit
        ) || 0

    })

    const result =
      Object.keys(grouped)
      .map(key=>({

        layanan:key,

        total:
          grouped[key].total,

        rataRata:

          grouped[key].total > 0

          ?

          (
            grouped[key].durasi

            /

            grouped[key].total

          ).toFixed(1)

          :

          0

      }))

    setData(result)

    setLoading(false)
  }

  return(

    <AuthGuard allowedRole="admin">

      <DashboardLayout role="admin">

        <div className="space-y-6">

          <div>

            <h1
              className="
                text-3xl
                font-bold
              "
            >

              Rekapan Internal

            </h1>

            <p
              className="
                text-gray-500
                mt-1
              "
            >

              Statistik layanan

            </p>

          </div>

          <div
            className="
              bg-white
              rounded-2xl
              shadow
              p-5
            "
          >

            <select

              value={filter}

              onChange={(e)=>
                setFilter(
                  e.target.value
                )
              }

              className="
                border
                p-3
                rounded-xl
              "
            >

              <option value="harian">

                Harian

              </option>

              <option value="mingguan">

                Mingguan

              </option>

              <option value="bulanan">

                Bulanan

              </option>

            </select>

          </div>

          <div
            className="
              bg-white
              rounded-2xl
              shadow
              overflow-hidden
            "
          >

            <table
              className="
                w-full
              "
            >

              <thead
                className="
                  bg-gray-100
                "
              >

                <tr>

                  <th className="p-4">

                    Jenis Layanan

                  </th>

                  <th className="p-4">

                    Total

                  </th>

                  <th className="p-4">

                    Rata-rata Waktu

                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  loading
                  ?

                  <tr>

                    <td
                      colSpan="3"
                      className="
                        p-10
                        text-center
                      "
                    >

                      Loading...

                    </td>

                  </tr>

                  :

                  data.map((item,index)=>(

                    <tr
                      key={index}
                      className="
                        border-t
                      "
                    >

                      <td
                        className="
                          p-4
                        "
                      >

                        {item.layanan}

                      </td>

                      <td
                        className="
                          p-4
                          font-bold
                        "
                      >

                        {item.total}

                      </td>

                      <td
                        className="
                          p-4
                        "
                      >

                        {item.rataRata}
                        Menit

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