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

      .not(
        "status",
        "in",
        "(diterima,dibatalkan,ditolak)"
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

    setAntrian(data || null)

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
  // AUTO CANCEL
  // =========================
  async function autoCancelAntrian(){

    if(!antrian?.id) return

    const { error } = await supabase

      .from("antrians")

      .update({
        status:"dibatalkan"
      })

      .eq("id", antrian.id)

    if(error){

      console.log(error)

      return
    }

    setAntrian(null)
  }

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

      // =========================
      // AUTO BATAL
      // =========================
      if(distance <= 0){

        setSisaWaktu("00:00")

        clearInterval(interval)

        autoCancelAntrian()

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
          .padStart(2,"0")}:${String(seconds)
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
            flex
            justify-center
            px-4
          ">

            <div className="
              w-full
              max-w-4xl
              bg-white
              rounded-3xl
              border
              border-gray-100
              shadow-sm
              p-6
            ">

              Loading...

            </div>

          </div>

        </DashboardLayout>

      </AuthGuard>
    )
  }

  return(

    <AuthGuard allowedRole="masyarakat">

      <DashboardLayout role="masyarakat">

        <div className="
          w-full
          flex
          justify-center
          px-3
          sm:px-5
          lg:px-6
        ">

          <div className="
            w-full
            max-w-4xl
          ">

            {/* HEADER */}

            <div className="mb-6">

              <h1 className="
                text-2xl
                sm:text-3xl
                font-bold
                text-gray-800
              ">

                Dashboard Masyarakat

              </h1>

              <p className="
                text-sm
                sm:text-base
                text-gray-500
                mt-1
              ">

                Informasi antrian terbaru

              </p>

            </div>

            {/* BELUM ADA */}

            {
              !antrian && (

                <div className="
                  bg-white
                  rounded-3xl
                  border
                  border-gray-100
                  shadow-sm
                  p-6
                  sm:p-8
                  text-center
                ">

                  <div className="
                    w-16
                    h-16
                    mx-auto
                    rounded-full
                    bg-blue-50
                    flex
                    items-center
                    justify-center
                    text-2xl
                    mb-4
                  ">

                    📋

                  </div>

                  <h1 className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-gray-800
                  ">

                    Belum Ada Antrian

                  </h1>

                  <p className="
                    text-gray-500
                    mt-2
                    text-sm
                    sm:text-base
                  ">

                    Silahkan ambil antrian terlebih dahulu

                  </p>

                </div>

              )
            }

            {/* CARD */}

            {
              antrian && (

                <div className="
                  bg-white
                  rounded-3xl
                  border
                  border-gray-100
                  shadow-sm
                  overflow-hidden
                ">

                  {/* HEADER */}

                  <div className="
                    bg-blue-600
                    px-5
                    sm:px-8
                    py-6
                    text-white
                  ">

                    <div className="
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-4
                    ">

                      <div>

                        <h1 className="
                          text-xl
                          sm:text-2xl
                          font-bold
                        ">

                          Nomor Antrian

                        </h1>

                        <p className="
                          text-blue-100
                          mt-1
                          text-sm
                          sm:text-base
                        ">

                          Silahkan tunggu panggilan

                        </p>

                      </div>

                      <div className="
                        self-start
                        sm:self-auto
                      ">

                        <span className="
                          bg-white/20
                          px-4
                          py-2
                          rounded-full
                          capitalize
                          text-sm
                          font-medium
                          backdrop-blur-sm
                        ">

                          {antrian.status}

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* BODY */}

                  <div className="
                    p-5
                    sm:p-8
                  ">

                    {/* NOMOR */}

                    <div className="
                      text-center
                      mb-8
                    ">

                      <p className="
                        text-gray-500
                        text-sm
                        mb-3
                      ">

                        Nomor Anda

                      </p>

                      <h1 className="
                        text-4xl
                        sm:text-5xl
                        md:text-6xl
                        font-extrabold
                        tracking-wide
                        text-blue-700
                        break-words
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
                      grid-cols-1
                      sm:grid-cols-2
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
                      rounded-2xl
                      p-4
                      sm:p-5
                    ">

                      <p className="
                        text-orange-700
                        text-sm
                        sm:text-base
                        leading-relaxed
                        font-medium
                      ">

                        Jika dalam 30 menit belum datang,
                        maka antrian otomatis dibatalkan.

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
                        transition
                        text-white
                        py-3.5
                        rounded-2xl
                        font-semibold
                        text-sm
                        sm:text-base
                      "
                    >

                      Batalkan Antrian

                    </button>

                  </div>

                </div>

              )
            }

          </div>

        </div>

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
      border
      border-gray-100
      rounded-2xl
      p-4
      sm:p-5
      min-h-[110px]
      flex
      flex-col
      justify-center
    ">

      <p className="
        text-gray-500
        text-sm
      ">

        {title}

      </p>

      <h1 className="
        text-base
        sm:text-lg
        font-bold
        text-gray-800
        mt-2
        break-words
      ">

        {value}

      </h1>

    </div>
  )
}