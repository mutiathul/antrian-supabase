"use client"

import { useEffect, useState }

from "react"

import { supabase }

from "../../../../lib/supabaseClient"

import DashboardLayout

from "../../../components/layouts/DashboardLayout"

import AuthGuard

from "../../../components/guards/AuthGuard"

export default function DashboardPetugas(){

  const [userData, setUserData]
    = useState(null)

  const [antrians, setAntrians]
    = useState([])

  const [loading, setLoading]
    = useState(true)

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

    const { data, error }
      = await supabase

      .from("users")

      .select("*")

      .eq("id", session.user.id)

      .single()

    if(error){

      console.log(error)

      return
    }

    setUserData(data)
  }

  // =========================
  // AUTO EXPIRED
  // =========================
  useEffect(()=>{

    checkExpired()

    const interval = setInterval(()=>{

      checkExpired()

    },10000)

    return ()=> clearInterval(interval)

  },[])

  async function checkExpired(){

    const now =
      new Date().toISOString()

    await supabase

      .from("antrians")

      .update({
        status:"dibatalkan"
      })

      .lt("expired_at", now)

      .in("status",[
        "menunggu",
        "diproses"
      ])
  }

  // =========================
  // GET ANTRIANS
  // =========================
  async function getAntrians(loketPetugas){

    if(!loketPetugas) return

    setLoading(true)

    const today =
      new Date()
      .toISOString()
      .split("T")[0]

    let query = supabase

      .from("antrians")

      .select(`
        *,
        layanans(*)
      `)

      .eq(
        "tanggal_antrian",
        today
      )

    // =========================
    // FRONT OFFICE
    // =========================
    if(loketPetugas === "FO"){

      query = query.eq(
        "status",
        "verifikasi"
      )

    }else{

      query = query

        .eq("loket", loketPetugas)

        .in("status",[
          "menunggu",
          "diproses"
        ])
    }

    const { data, error }
      = await query

      .order("created_at",{
        ascending:true
      })

    if(error){

      console.log(error)

      setLoading(false)

      return
    }

    setAntrians(data || [])

    setLoading(false)
  }

  // =========================
  // LOAD DATA
  // =========================
  useEffect(()=>{

    if(!userData?.loket) return

    getAntrians(userData.loket)

  },[userData])

  // =========================
  // REALTIME
  // =========================
  useEffect(()=>{

    if(!userData?.loket) return

    const channel = supabase

      .channel(
        `petugas-${userData.loket}`
      )

      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"antrians"
        },

        ()=>{

          getAntrians(userData.loket)
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
 async function panggil(item){

  speechSynthesis.cancel()

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

  speechSynthesis.speak(suara)
}

  // =========================
  // PROSES ANTRIAN
  // =========================
  async function prosesAntrian(item){

    // jika diproses petugas lain
    if(

      item.diproses_oleh

      &&

      item.diproses_oleh
      !== userData.id

    ){

      alert(
        "Antrian sedang diproses petugas lain"
      )

      return
    }

    const { error }
      = await supabase

      .from("antrians")

      .update({

        status:"diproses",

        diproses_oleh:
          userData.id

      })

      .eq("id", item.id)

      .eq(
        "status",
        "menunggu"
      )

    if(error){

      alert(error.message)

      return
    }

    getAntrians(userData.loket)
  }

  // =========================
  // SELESAI
  // =========================
 async function selesaiAntrian(id){

  // =========================
  // SESSION PETUGAS
  // =========================
  const {
    data:{session}
  } = await supabase.auth.getSession()

  if(!session){

    alert("Session tidak ditemukan")
    return
  }

  // =========================
  // UPDATE
  // =========================
  const { error } = await supabase

    .from("antrians")

    .update({

      status:"selesai",

      //petugas_id: session.user.id

    })

    .eq("id", id)

  if(error){

    alert(error.message)
    return
  }

  alert("Antrian selesai")
}

  // =========================
  // APPROVE FO
  // =========================
 async function approveFO(item){

  const today =
    new Date()
    .toISOString()
    .split("T")[0]

  // =========================
  // AMBIL DATA LAYANAN
  // =========================
 // =========================
// AMBIL NAMA LAYANAN
// =========================
const namaLayanan =
  item.layanans?.nama_layanan

let kodeAntrian = ""
let loketTujuan = "Loket 8"

// =========================
// KARTU KELUARGA
// =========================
if(
  namaLayanan === "Kartu Keluarga"
){

  kodeAntrian = "KK"
}

// =========================
// PINDAH DATANG
// =========================
else if(
  namaLayanan === "Pindah Datang"
){

  kodeAntrian = "PD"
}

// =========================
// AKTA LAHIR
// =========================
else if(
  namaLayanan === "Akta Lahir"
){

  kodeAntrian = "AL"
}

// =========================
// AKTA KEMATIAN
// =========================
else if(
  namaLayanan === "Akta Kematian"
){

  kodeAntrian = "AK"
}

// =========================
// DEFAULT
// =========================
else{

  kodeAntrian = "FO"
}

  // =========================
  // HITUNG NOMOR HARI INI
  // =========================
 const { data: totalToday }
  = await supabase

  .from("antrians")

  .select("id")

  .like(
    "nomor_antrian",
    `${kodeAntrian}-%`
  )

  .eq(
    "tanggal_antrian",
    today
  )
  const nomorUrut = String(

    (totalToday?.length || 0) + 1

  ).padStart(3,"0")

  // =========================
  // FORMAT NOMOR
  // =========================
  const nomorAntrian =
    `${kodeAntrian}-${nomorUrut}`

  // =========================
  // EXPIRED
  // =========================
  const expiredAt =
    new Date(
      Date.now() + 30 * 60 * 1000
    ).toISOString()

  // =========================
  // UPDATE DATABASE
  // =========================
  const { error } = await supabase

    .from("antrians")

    .update({

      nomor_antrian:
        nomorAntrian,

      loket:
        loketTujuan,

      status:
        "menunggu",

      status_dokumen:
        "lengkap",

      perlu_verifikasi:
        false,

      expired_at:
        expiredAt

    })

    .eq("id", item.id)

  if(error){

    alert(error.message)

    return
  }

  alert(
    `Antrian ${nomorAntrian}
masuk ke ${loketTujuan}`
  )

  getAntrians(userData.loket)
}

  // =========================
  // TOLAK FO
  // =========================
  async function tolakFO(id){

    const { error }
      = await supabase

      .from("antrians")

      .update({

        status:"ditolak",

        status_dokumen:
          "ditolak"

      })

      .eq("id", id)

    if(error){

      alert(error.message)

      return
    }

    getAntrians(userData.loket)
  }

  // =========================
  // COUNT
  // =========================
  const total =
    antrians.length

  const menunggu =
    antrians.filter(
      i => i.status === "menunggu"
    ).length

  const diproses =
    antrians.filter(
      i => i.status === "diproses"
    ).length

  return(

    <AuthGuard allowedRole="petugas">

      <DashboardLayout role="petugas">

        {/* HEADER */}

        <div className="mb-6">

          <h1
            className="
              text-3xl
              font-bold
            "
          >

            Dashboard Petugas

          </h1>

          <p className="text-gray-500 mt-1">

            {userData?.loket}

          </p>

        </div>

        {/* CARD */}

        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-3
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
            title="Diproses"
            value={diproses}
          />

        </div>

        {/* TABLE */}

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
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  loading ? (

                    <tr>

                      <td
                        colSpan="4"
                        className="
                          p-10
                          text-center
                        "
                      >

                        Loading...

                      </td>

                    </tr>

                  ) : antrians.length > 0 ? (

                    antrians.map((item)=>(

                      <tr
                        key={item.id}
                        className="border-t"
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

                          <span
                            className={`
                              px-3 py-1
                              rounded-full
                              text-sm

                              ${
                                item.status
                                === "menunggu"

                                ? "bg-yellow-100 text-yellow-700"

                                : "bg-blue-100 text-blue-700"
                              }
                            `}
                          >

                            {item.status}

                          </span>

                        </td>

                        <td className="p-4">

                          {
                            userData?.loket
                            === "FO"

                            ? (

                              <div className="flex gap-2">

                                <button
                                  onClick={()=>
                                    approveFO(item)
                                  }
                                  className="
                                    bg-green-600
                                    text-white
                                    px-4 py-2
                                    rounded-lg
                                  "
                                >

                                  Lengkap

                                </button>

                                <button
                                  onClick={()=>
                                    tolakFO(item.id)
                                  }
                                  className="
                                    bg-red-600
                                    text-white
                                    px-4 py-2
                                    rounded-lg
                                  "
                                >

                                  Tolak

                                </button>

                              </div>

                            ) : (

                              <div className="flex gap-2">

                                {/* =========================
                                    STATUS MENUNGGU
                                ========================= */}

                                {
                                  item.status
                                  === "menunggu"

                                  && (

                                    <>

                                      {/* PANGGIL */}

                                      <button
                                        onClick={()=>
                                          panggil(item)
                                        }
                                        className="
                                          bg-blue-600
                                          text-white
                                          px-4 py-2
                                          rounded-lg
                                        "
                                      >

                                        Panggil

                                      </button>

                                      {/* PROSES */}

                                      {
                                        (
                                          !item.diproses_oleh

                                          ||

                                          item.diproses_oleh
                                          === userData.id
                                        )

                                        ? (

                                          <button
                                            onClick={()=>
                                              prosesAntrian(item)
                                            }
                                            className="
                                              bg-yellow-500
                                              text-white
                                              px-4 py-2
                                              rounded-lg
                                            "
                                          >

                                            Proses

                                          </button>

                                        ) : (

                                          <span
                                            className="
                                              bg-red-100
                                              text-red-700
                                              px-3 py-2
                                              rounded-lg
                                              text-sm
                                            "
                                          >

                                            Diproses petugas lain

                                          </span>

                                        )
                                      }

                                    </>

                                  )
                                }

                                {/* =========================
                                    STATUS DIPROSES
                                ========================= */}

                                {
                                  item.status
                                  === "diproses"

                                  &&

                                  item.diproses_oleh
                                  === userData.id

                                  && (

                                    <button
                                      onClick={()=>
                                        selesaiAntrian(item.id)
                                      }
                                      className="
                                        bg-green-600
                                        text-white
                                        px-4 py-2
                                        rounded-lg
                                      "
                                    >

                                      Selesai

                                    </button>

                                  )
                                }

                              </div>

                            )
                          }

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="4"
                        className="
                          p-10
                          text-center
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
// CARD
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
      "
    >

      <p className="text-gray-500">

        {title}

      </p>

      <h1
        className="
          text-4xl
          font-bold
          mt-2
        "
      >

        {value}

      </h1>

    </div>
  )
}