"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function DashboardPetugas(){

  const [userData, setUserData]
    = useState(null)

  const [antrians, setAntrians]
    = useState([])

  const [total, setTotal]
    = useState(0)

  const [menunggu, setMenunggu]
    = useState(0)

  const [dipanggil, setDipanggil]
    = useState(0)

  const [selesai, setSelesai]
    = useState(0)

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

    setUserData(data)
  }

  // =========================
  // GET ANTRIAN
  // =========================
  useEffect(()=>{

    if(userData){

      getAntrians()
    }

  },[userData])

 async function getAntrians(){

  if(!userData?.loket) return

  console.log("LOKET LOGIN:", userData.loket)

  const { data, error } = await supabase
    .from("antrians")
    .select(`
      *,
      layanans(*)
    `)
     .eq(
  "loket", 

  userData.loket === "FO"
    ? "FO"
    : userData.loket
)
    .order("created_at", {
      ascending:true
    })

  console.log("DATA ANTRIAN:", data)

  if(error){

    console.log(error)
    return
  }

  setAntrians(data || [])

  setTotal(data?.length || 0)

  setMenunggu(
    data?.filter(
      i =>
        i.status === "menunggu"
        ||
        i.status === "verifikasi"
    ).length || 0
  )

  setDipanggil(
    data?.filter(
      i => i.status === "dipanggil"
    ).length || 0
  )

  setSelesai(
    data?.filter(
      i =>
        i.status === "diterima"
        ||
        i.status === "ditolak"
    ).length || 0
  )
}

  // =========================
  // REALTIME
  // =========================
  useEffect(()=>{

    const channel = supabase
      .channel("dashboard-petugas")

      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"antrians"
        },
        ()=>{

          if(userData){

            getAntrians()
          }
        }
      )
      .subscribe()

    return ()=>{

      supabase.removeChannel(channel)
    }

  },[userData])

  // =========================
  // PANGGIL ANTRIAN
  // =========================
  async function panggil(item){

    if(item.status === "dipanggil"){

      alert("Antrian sudah dipanggil")
      return
    }

    await supabase
      .from("antrians")
      .update({
        status:"dipanggil"
      })
      .eq("id", item.id)

    const textSuara =

      `Nomor antrian
      ${item.nomor_antrian},
      silahkan menuju
      ${item.loket}`

    const suara =
      new SpeechSynthesisUtterance(
        textSuara
      )

    suara.lang = "id-ID"

    suara.rate = 0.9

    suara.pitch = 1

    suara.volume = 1

    speechSynthesis.cancel()

    speechSynthesis.speak(suara)
  }

  // =========================
  // SELESAI
  // =========================
  async function selesaiAntrian(id){

    await supabase
      .from("antrians")
      .update({
        status:"diterima"
      })
      .eq("id", id)
  }

  // =========================
  // APPROVE FO
  // =========================
 async function approveFO(item){

  try{

    // =========================
    // TANGGAL HARI INI
    // =========================

    const today =
      new Date()
      .toISOString()
      .split("T")[0]

    // =========================
    // HITUNG TOTAL LOKET 8
    // =========================

    const { data: totalToday, error: totalError }
      = await supabase

      .from("antrians")

      .select("id")

      .eq("loket", "Loket 8")

      .eq("tanggal_antrian", today)

    if(totalError){

      alert(totalError.message)
      return
    }

    // =========================
    // NOMOR URUT
    // =========================

    const nomorUrut = String(
      (totalToday?.length || 0) + 1
    ).padStart(3,"0")

    // =========================
    // NOMOR ANTRIAN
    // =========================

    const nomorAntrian =
      `A-${nomorUrut}`

    // =========================
    // UPDATE DATABASE
    // =========================

    const { data:updateData, error:updateError }
      = await supabase

      .from("antrians")

      .update({

        nomor_antrian:
          nomorAntrian,

        loket:
          "Loket 8",

        status:
          "menunggu",

        status_dokumen:
          "lengkap",

        perlu_verifikasi:
          false

      })

      .eq("id", item.id)

      .select()

    console.log(updateData)

    if(updateError){

      alert(updateError.message)
      return
    }

    alert(
      `Antrian berhasil dibuat:
${nomorAntrian}
Menuju Loket 8`
    )

    // refresh
    getAntrians()

  }catch(err){

    console.log(err)

    alert("Terjadi kesalahan")
  }
}

  // =========================
  // TOLAK FO
  // =========================
  async function tolakFO(id){

    await supabase
      .from("antrians")
      .update({

        status:"ditolak",

        status_dokumen:
          "ditolak"

      })
      .eq("id", id)

    alert("Dokumen ditolak")
  }

  return(

    <AuthGuard allowedRole="petugas">

      <DashboardLayout role="petugas">

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          "
        >

          <div>

            <h1
              className="
                text-2xl
                md:text-3xl
                font-bold
                text-gray-800
              "
            >

              Dashboard Petugas

            </h1>

            <p
              className="
                text-gray-500
                mt-1
              "
            >

              {userData?.loket}

            </p>

          </div>

        </div>

        {/* CARD */}

        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-4
            mb-6
          "
        >

          <Card
            title="Total"
            value={total}
          />

          <Card
            title="Menunggu"
            value={menunggu}
          />

          <Card
            title="Dipanggil"
            value={dipanggil}
          />

          <Card
            title="Selesai"
            value={selesai}
          />

        </div>

        {/* TABEL */}

        <div
          className="
            bg-white
            rounded-2xl
            shadow
            overflow-hidden
          "
        >

          <div
            className="
              p-5
              border-b
            "
          >

            <h2
              className="
                text-xl
                font-bold
                text-gray-800
              "
            >

              Daftar Antrian

            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead
                className="
                  bg-gray-100
                  text-gray-700
                "
              >

                <tr>

                  <th className="p-4 text-left">
                    Nomor
                  </th>

                  <th className="p-4 text-left">
                    Nama
                  </th>

                  <th className="p-4 text-left">
                    Layanan
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  antrians.length > 0 ? (

                    antrians.map((item)=>(

                      <tr
                        key={item.id}
                        className="
                          border-t
                          hover:bg-gray-50
                        "
                      >

                        <td
                          className="
                            p-4
                            font-bold
                            text-blue-700
                          "
                        >

                          {
                            item.nomor_antrian
                            || "-"
                          }

                        </td>

                        <td className="p-4">

                          {item.nama_pemohon}

                        </td>

                        <td className="p-4">

                          {
                            item.layanans
                            ?.nama_layanan
                          }

                        </td>

                        <td className="p-4">

                          <span
                            className={`

                              px-3 py-1
                              rounded-full
                              text-sm
                              font-medium

                              ${
                                item.status === "menunggu"
                                ? "bg-yellow-100 text-yellow-700"

                                : item.status === "dipanggil"
                                ? "bg-blue-100 text-blue-700"

                                : item.status === "ditolak"
                                ? "bg-red-100 text-red-700"

                                : item.status === "verifikasi"
                                ? "bg-purple-100 text-purple-700"

                                : "bg-green-100 text-green-700"
                              }

                            `}
                          >

                            {item.status}

                          </span>

                        </td>

                        <td className="p-4">

                          <div
                            className="
                              flex
                              flex-wrap
                              gap-2
                            "
                          >

                            {/* FO */}

                            {
                              userData?.loket
                              === "FO"

                              &&

                              item.status
                              === "verifikasi"

                              && (

                                <>

                                  <button
                                    onClick={()=>
                                      approveFO(item)
                                    }
                                    className="
                                      bg-green-600
                                      hover:bg-green-700
                                      text-white
                                      px-4 py-2
                                      rounded-lg
                                      text-sm
                                    "
                                  >

                                    Dokumen Lengkap

                                  </button>

                                  <button
                                    onClick={()=>
                                      tolakFO(item.id)
                                    }
                                    className="
                                      bg-red-600
                                      hover:bg-red-700
                                      text-white
                                      px-4 py-2
                                      rounded-lg
                                      text-sm
                                    "
                                  >

                                    Dokumen Ditolak

                                  </button>

                                </>

                              )
                            }

                            {/* LOKET BIASA */}

                            {
                              userData?.loket
                              !== "FO"

                              && (

                                <>

                                  {
                                    item.status
                                    !== "dipanggil"

                                    &&

                                    item.status
                                    !== "diterima"

                                    &&

                                    <button
                                      onClick={()=>
                                        panggil(item)
                                      }
                                      className="
                                        bg-blue-600
                                        hover:bg-blue-700
                                        text-white
                                        px-4 py-2
                                        rounded-lg
                                        text-sm
                                      "
                                    >

                                      Panggil

                                    </button>
                                  }

                                  {
                                    item.status
                                    !== "diterima"

                                    &&

                                    <button
                                      onClick={()=>
                                        selesaiAntrian(item.id)
                                      }
                                      className="
                                        bg-green-600
                                        hover:bg-green-700
                                        text-white
                                        px-4 py-2
                                        rounded-lg
                                        text-sm
                                      "
                                    >

                                      Selesai

                                    </button>
                                  }

                                </>

                              )
                            }

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="
                          text-center
                          p-10
                          text-gray-500
                        "
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
}

// =========================
// CARD COMPONENT
// =========================

function Card({

  title,
  value

}){

  return(

    <div
      className="
        bg-white
        rounded-2xl
        shadow
        p-5
        min-h-[120px]

        flex
        flex-col
        justify-center
      "
    >

      <p
        className="
          text-gray-500
          text-sm
          md:text-base
        "
      >

        {title}

      </p>

      <h2
        className="
          text-3xl
          md:text-4xl
          font-bold
          mt-2
          text-gray-800
        "
      >

        {value}

      </h2>

    </div>
  )
}