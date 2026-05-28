"use client"

import { useEffect, useState } from "react"

import { supabase }
from "../../../../lib/supabaseClient"

import DashboardLayout
from "../../../components/layouts/DashboardLayout"

import AuthGuard
from "../../../components/guards/AuthGuard"

export default function UserDashboard(){

  const [antrian,setAntrian]
    = useState(null)

  const [loading,setLoading]
    = useState(true)

  const [sisaWaktu,setSisaWaktu]
    = useState("")

  // =========================
  // GET DATA
  // =========================
  async function getAntrian(){

    const {
      data:{session}
    } = await supabase.auth.getSession()

    if(!session){

      setLoading(false)
      return
    }

    const today =
      new Date()
      .toISOString()
      .split("T")[0]

    const { data,error }
      = await supabase

      .from("antrians")

      .select(`
        *,
        layanans(*)
      `)

      .eq(
        "user_id",
        session.user.id
      )

      .eq(
        "tanggal_antrian",
        today
      )

      .order("created_at",{
        ascending:false
      })

      .limit(1)

      .maybeSingle()

    if(error){

      console.log(error)

      setLoading(false)

      return
    }

    // reset dashboard
    if(

      !data

      ||

      data.status === "diterima"

      ||

      data.status === "dibatalkan"

      ||

      data.status === "ditolak"

    ){

      setAntrian(null)

    }else{

      setAntrian(data)
    }

    setLoading(false)
  }

  // =========================
  // REALTIME
  // =========================
  useEffect(()=>{

    getAntrian()

    const channel = supabase

      .channel("user-dashboard")

      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"antrians"
        },

        ()=>{

          getAntrian()
        }
      )

      .subscribe()

    return ()=>{

      supabase.removeChannel(channel)
    }

  },[])

  // =========================
  // COUNTDOWN
  // =========================
  useEffect(()=>{

    if(!antrian?.expired_at) return

    const interval = setInterval(()=>{

      const now =
        new Date().getTime()

      const expired =
        new Date(
          antrian.expired_at
        ).getTime()

      const distance =
        expired - now

      if(distance <= 0){

        setSisaWaktu("00:00")

        clearInterval(interval)

        return
      }

      const minutes = Math.floor(
        distance / 1000 / 60
      )

      const seconds = Math.floor(
        (distance / 1000) % 60
      )

      setSisaWaktu(

        `${String(minutes)
          .padStart(2,"0")}
        :
        ${String(seconds)
          .padStart(2,"0")}`

      )

    },1000)

    return ()=> clearInterval(interval)

  },[antrian])

  // =========================
  // CANCEL USER
  // =========================
  async function cancelAntrian(){

    const confirmCancel =
      confirm(
        "Batalkan antrian?"
      )

    if(!confirmCancel) return

    const { error } = await supabase

      .from("antrians")

      .update({
        status:"dibatalkan"
      })

      .eq("id", antrian.id)

    if(error){

      alert(error.message)

      return
    }

    setAntrian(null)
  }

  // =========================
  // LOADING
  // =========================
  if(loading){

    return(

      <AuthGuard allowedRole="masyarakat">

        <DashboardLayout role="masyarakat">

          <div className="
            bg-white
            p-6
            rounded-2xl
            shadow
          ">

            Loading...

          </div>

        </DashboardLayout>

      </AuthGuard>
    )
  }

  return(

    <AuthGuard allowedRole="masyarakat">

      <DashboardLayout role="masyarakat">

        {/* HEADER */}

        <div className="mb-6">

          <h1 className="
            text-3xl
            font-bold
          ">

            Dashboard Masyarakat

          </h1>

          <p className="text-gray-500 mt-1">

            Informasi antrian terbaru

          </p>

        </div>

        {/* BELUM ADA */}

        {
          !antrian && (

            <div className="
              bg-white
              p-6
              rounded-2xl
              shadow
            ">

              <h1 className="
                text-xl
                font-bold
              ">

                Belum Ada Antrian

              </h1>

              <p className="text-gray-500 mt-2">

                Silahkan ambil antrian

              </p>

            </div>

          )
        }

        {/* CARD */}

        {
          antrian && (

            <div className="
              bg-white
              rounded-2xl
              shadow
              overflow-hidden
            ">

              {/* HEADER */}

              <div className="
                bg-blue-600
                p-6
                text-white
              ">

                <div className="
                  flex
                  justify-between
                  items-center
                ">

                  <div>

                    <h1 className="
                      text-2xl
                      font-bold
                    ">

                      Nomor Antrian

                    </h1>

                    <p className="opacity-90">

                      Silahkan tunggu panggilan

                    </p>

                  </div>

                  <span className="
                    bg-white/20
                    px-4
                    py-2
                    rounded-full
                    capitalize
                  ">

                    {antrian.status}

                  </span>

                </div>

              </div>

              {/* BODY */}

              <div className="p-6">

                {/* NOMOR */}

                <div className="
                  text-center
                  mb-8
                ">

                  <h1 className="
                    text-6xl
                    font-bold
                    text-blue-700
                  ">

                    {
                      antrian.nomor_antrian
                      || "-"
                    }

                  </h1>

                </div>

                {/* GRID */}

                <div className="
                  grid
                  md:grid-cols-2
                  gap-4
                ">

                  <InfoCard
                    title="Tanggal"
                    value={
                      new Date(
                        antrian.created_at
                      ).toLocaleDateString(
                        "id-ID"
                      )
                    }
                  />

                  <InfoCard
                    title="Loket"
                    value={
                      antrian.loket || "-"
                    }
                  />

                  <InfoCard
                    title="Status"
                    value={
                      antrian.status
                    }
                  />

                  <InfoCard
                    title="Sisa Waktu"
                    value={
                      sisaWaktu || "-"
                    }
                  />

                </div>

                {/* CATATAN */}

                <div className="
                  mt-6
                  bg-orange-50
                  border
                  border-orange-200
                  rounded-xl
                  p-4
                ">

                  <p className="
                    text-orange-700
                    font-medium
                  ">

                    Jika dalam 30 menit
                    belum datang maka
                    antrian otomatis batal.

                  </p>

                </div>

                {/* BUTTON */}

                <button
                  onClick={cancelAntrian}
                  className="
                    mt-6
                    w-full
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    py-3
                    rounded-xl
                    font-medium
                  "
                >

                  Batalkan Antrian

                </button>

              </div>

            </div>

          )
        }

      </DashboardLayout>

    </AuthGuard>
  )
}

// =========================
// INFO CARD
// =========================
function InfoCard({

  title,
  value

}){

  return(

    <div className="
      bg-gray-50
      p-5
      rounded-xl
    ">

      <p className="text-gray-500">

        {title}

      </p>

      <h1 className="
        text-lg
        font-bold
        mt-2
      ">

        {value}

      </h1>

    </div>
  )
}