"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function PetugasAntrianPage(){

  // =========================
  // STATE
  // =========================
  const [userData, setUserData]
    = useState(null)

  const [antrians, setAntrians]
    = useState([])

  // =========================
  // GET USER LOGIN
  // =========================
  useEffect(()=>{

    getUser()

  },[])

  async function getUser(){

    const {
      data:{session}
    } = await supabase.auth.getSession()

    if(!session) return

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    console.log("USER LOGIN:", data)

    setUserData(data)
  }

  // =========================
  // GET ANTRIANS
  // =========================
  useEffect(()=>{

    if(userData){

      getAntrians()
    }

  },[userData])

  async function getAntrians(){

    if(!userData?.loket) return

    console.log(
      "LOKET PETUGAS:",
      userData.loket
    )

    const { data, error } =
      await supabase
      .from("antrians")
      .select(`
        *,
        layanans(*)
      `)
      .eq("loket", userData.loket)
      .order("created_at", {
        ascending:true
      })

    console.log("ANTRIANS:", data)
    console.log("ERROR:", error)

    setAntrians(data || [])
  }

  // =========================
  // REALTIME
  // =========================
  useEffect(()=>{

    const channel = supabase
      .channel("antrian-realtime")

      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"antrians"
        },
        ()=>{

          getAntrians()
        }
      )
      .subscribe()

    return ()=>{

      supabase.removeChannel(channel)
    }

  },[userData])

  // =========================
  // PANGGIL
  // =========================
  async function panggilAntrian(item){

    await supabase
      .from("antrians")
      .update({
        status:"dipanggil"
      })
      .eq("id", item.id)

    const suara =
      new SpeechSynthesisUtterance(

        `Nomor antrian
        ${item.nomor_antrian}
        silahkan menuju
        ${item.loket}`

      )

    speechSynthesis.speak(suara)
  }

  // =========================
  // TERIMA
  // =========================
  async function terimaAntrian(id){

    await supabase
      .from("antrians")
      .update({
        status:"diterima"
      })
      .eq("id", id)
  }

  // =========================
  // TOLAK
  // =========================
  async function tolakAntrian(id){

    await supabase
      .from("antrians")
      .update({
        status:"ditolak"
      })
      .eq("id", id)
  }

  // =========================
  // UI
  // =========================
  return(

    <AuthGuard allowedRole="petugas">

      <DashboardLayout role="petugas">

        <div className="bg-white p-5 rounded-lg shadow">

          <h1 className="text-2xl font-bold mb-5">

            Data Antrian {userData?.loket}

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

                      <td className="border p-3">

                        {item.nomor_antrian}

                      </td>

                      <td className="border p-3">

                        {item.nama_pemohon}

                      </td>

                      <td className="border p-3">

                        {
                          item.layanans
                          ?.nama_layanan
                        }

                      </td>

                      <td className="border p-3">

                        {item.status}

                      </td>

                      <td className="border p-3">

                        <div className="flex gap-2">

                          <button
                            onClick={()=>
                              panggilAntrian(item)
                            }
                            className="
                              bg-blue-600
                              text-white
                              px-3 py-1
                              rounded
                            "
                          >

                            Panggil

                          </button>

                          <button
                            onClick={()=>
                              terimaAntrian(item.id)
                            }
                            className="
                              bg-green-600
                              text-white
                              px-3 py-1
                              rounded
                            "
                          >

                            Terima

                          </button>

                          <button
                            onClick={()=>
                              tolakAntrian(item.id)
                            }
                            className="
                              bg-red-600
                              text-white
                              px-3 py-1
                              rounded
                            "
                          >

                            Tolak

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