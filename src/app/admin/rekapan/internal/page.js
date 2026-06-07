"use client"

import { useEffect,useState }

from "react"

import { supabase }

from "../../../../../lib/supabaseClient"

import DashboardLayout

from "../../../../components/layouts/DashboardLayout"

import AuthGuard

from "../../../../components/guards/AuthGuard"

export default function RekapanInternalPage(){

  const [loading,setLoading]
    = useState(true)

  const [data,setData]
    = useState([])

  const [filter,setFilter]
    = useState("harian")

  const [tanggal,setTanggal]
    = useState(
      new Date()
      .toISOString()
      .split("T")[0]
    )

  const [bulan,setBulan]
    = useState(
      new Date()
      .toISOString()
      .slice(0,7)
    )

  useEffect(()=>{

    loadData()

  },[
    filter,
    tanggal,
    bulan
  ])

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

    if(filter==="harian"){

      query = query.eq(
        "tanggal_antrian",
        tanggal
      )
    }

    const { data }

      = await query

    const grouped = {}

    data?.forEach(item=>{

      const layanan =

        item.layanans
        ?.nama_layanan

        || "Lainnya"

      if(!grouped[layanan]){

        grouped[layanan] = {

          total:0,

          totalDurasi:0
        }
      }

      grouped[layanan].total++

      grouped[layanan].totalDurasi +=

        Number(
          item.durasi_pelayanan_menit
          || 0
        )
    })

    const result =

      Object.keys(grouped)

      .map(key=>({

        layanan:key,

        total:
          grouped[key].total,

        rataRata:

          grouped[key].totalDurasi

          /

          grouped[key].total

      }))

    setData(result)

    setLoading(false)
  }

  return(

    <AuthGuard allowedRole="admin">

      <DashboardLayout role="admin">

        <div className="space-y-6">

          <h1
            className="
              text-3xl
              font-bold
            "
          >

            Rekapan Internal

          </h1>

          <div
            className="
              bg-white
              p-4
              rounded-2xl
              shadow
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
                p-2
                rounded
              "
            >

              <option value="harian">

                Harian

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
              className="w-full"
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
                  ? (

                    <tr>

                      <td
                        colSpan="3"
                        className="
                          p-6
                          text-center
                        "
                      >

                        Loading...

                      </td>

                    </tr>

                  )

                  :

                  data.map((item,i)=>(

                    <tr
                      key={i}
                      className="
                        border-t
                      "
                    >

                      <td className="p-4">

                        {item.layanan}

                      </td>

                      <td className="p-4">

                        {item.total}

                      </td>

                      <td className="p-4">

                        {
                          item.rataRata
                          .toFixed(1)
                        }

                        menit

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