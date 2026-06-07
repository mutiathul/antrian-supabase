"use client"

import { useEffect, useState }

from "react"

import { supabase }

from "../../../../lib/supabaseClient"

import DashboardLayout

from "../../../components/layouts/DashboardLayout"

import AuthGuard

from "../../../components/guards/AuthGuard"

export default function RekapanMasyarakatPage(){

  const [loading,setLoading]
    = useState(true)

  const [data,setData]
    = useState([])

  const [search,setSearch]
    = useState("")

  useEffect(()=>{

    loadData()

  },[])

  async function loadData(){

    const { data,error }

      = await supabase

      .from("antrians")

      .select(`
        *,
        layanans(
          nama_layanan
        )
      `)

      .order(
        "created_at",
        {
          ascending:false
        }
      )

    if(error){

      console.log(error)

      return
    }

    setData(data || [])

    setLoading(false)
  }

  const filteredData =

    data.filter(item=>

      item.nama_pemohon
      ?.toLowerCase()

      .includes(
        search.toLowerCase()
      )
    )

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

              Rekapan Masyarakat

            </h1>

          </div>

          <input

            type="text"

            placeholder="
            Cari Nama Pemohon
            "

            value={search}

            onChange={(e)=>

              setSearch(
                e.target.value
              )
            }

            className="
              w-full
              border
              p-3
              rounded-xl
            "
          />

          <div
            className="
              bg-white
              rounded-2xl
              shadow
              overflow-auto
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
                    Nama
                  </th>

                  <th className="p-4">
                    JK
                  </th>

                  <th className="p-4">
                    Kecamatan
                  </th>

                  <th className="p-4">
                    Nagari
                  </th>

                  <th className="p-4">
                    Jorong
                  </th>

                  <th className="p-4">
                    Layanan
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  loading

                  ?

                  <tr>

                    <td
                      colSpan="6"
                      className="
                        text-center
                        p-10
                      "
                    >

                      Loading...

                    </td>

                  </tr>

                  :

                  filteredData.map((item)=>(

                    <tr
                      key={item.id}
                      className="
                        border-t
                      "
                    >

                      <td className="p-4">

                        {
                          item.nama_pemohon
                        }

                      </td>

                      <td className="p-4">

                        {
                          item.jenis_kelamin
                        }

                      </td>

                      <td className="p-4">

                        {
                          item.kecamatan
                        }

                      </td>

                      <td className="p-4">

                        {
                          item.nagari
                        }

                      </td>

                      <td className="p-4">

                        {
                          item.jorong
                        }

                      </td>

                      <td className="p-4">

                        {
                          item.layanans
                          ?.nama_layanan
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