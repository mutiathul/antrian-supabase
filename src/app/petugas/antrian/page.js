"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function PetugasAntrianPage() {

  const [antrians, setAntrians] = useState([])

  useEffect(() => {

    getAntrians()

    const interval = setInterval(() => {

      getAntrians()

    }, 3000)

    return () => clearInterval(interval)

  }, [])

  async function getAntrians() {

    const { data } = await supabase
      .from("antrians")
      .select(`
        *,
        layanans (
          nama_layanan
        )
      `)
      .order("created_at", { ascending: true })

    setAntrians(data || [])
  }

  async function updateStatus(id, status, nomor) {

    const { error } = await supabase
      .from("antrians")
      .update({
        status: status
      })
      .eq("id", id)

    if (error) {

      alert(error.message)
      return
    }

    // text to speech
    if (status === "dipanggil") {

      const suara = new SpeechSynthesisUtterance(
        `Nomor antrian ${nomor} dipersilahkan menuju loket pelayanan`
      )

      suara.lang = "id-ID"

      window.speechSynthesis.speak(suara)
    }

    getAntrians()
  }

  async function resetStatus(id) {

    await supabase
      .from("antrians")
      .update({
        status: "menunggu"
      })
      .eq("id", id)

    getAntrians()
  }

  async function hapusAntrian(id) {

    const konfirmasi = confirm(
      "Yakin ingin menghapus antrian?"
    )

    if (!konfirmasi) return

    await supabase
      .from("antrians")
      .delete()
      .eq("id", id)

    getAntrians()
  }

  function getBadge(status){

    if(status === "menunggu"){
      return "bg-yellow-500"
    }

    if(status === "dipanggil"){
      return "bg-blue-500"
    }

    if(status === "diterima"){
      return "bg-green-500"
    }

    if(status === "ditolak"){
      return "bg-red-500"
    }

    return "bg-gray-500"
  }

  return (

    <AuthGuard allowedRole="petugas">

      <DashboardLayout role="petugas">

        <div className="bg-white p-5 rounded-lg shadow">

          <h1 className="text-2xl font-bold mb-5">
            Antrian Masuk
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

                  <th className="border p-3">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  antrians.map((item)=>(

                    <tr key={item.id}>

                      <td className="border p-3 font-bold">

                        {item.nomor_antrian}

                      </td>

                      <td className="border p-3">

                        {item.nama_pemohon}

                      </td>

                      <td className="border p-3">

                        {item.layanans?.nama_layanan}

                      </td>

                      <td className="border p-3">

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

                      <td className="border p-3">

                        <div className="flex flex-wrap gap-2">

                          <button
                            onClick={()=>updateStatus(
                              item.id,
                              "dipanggil",
                              item.nomor_antrian
                            )}
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                          >
                            Panggil
                          </button>

                          <button
                            onClick={()=>updateStatus(
                              item.id,
                              "diterima"
                            )}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                          >
                            Terima
                          </button>

                          <button
                            onClick={()=>updateStatus(
                              item.id,
                              "ditolak"
                            )}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Tolak
                          </button>

                          <button
                            onClick={()=>resetStatus(item.id)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                          >
                            Reset
                          </button>

                          <button
                            onClick={()=>hapusAntrian(item.id)}
                            className="bg-gray-700 text-white px-3 py-1 rounded"
                          >
                            Hapus
                          </button>

                        </div>

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