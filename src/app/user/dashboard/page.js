"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function UserDashboard(){

  const [antrian, setAntrian]
    = useState(null)

  const [loading, setLoading]
    = useState(true)

  // =========================
  // GET ANTRIAN USER
  // =========================
  useEffect(()=>{

    getAntrian()

  },[])

  async function getAntrian(){

    const {
      data:{session}
    } = await supabase.auth.getSession()

    if(!session){

      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("antrians")
      .select(`
        *,
        layanans(*)
      `)
      .eq("user_id", session.user.id)

      .in("status",[

        "menunggu",

        "dipanggil",

        "verifikasi",

        "diterima",

        "ditolak"

      ])

      .order("created_at",{
        ascending:false
      })

      .limit(1)

      .single()

    setAntrian(data)

    setLoading(false)
  }

  // =========================
  // REALTIME
  // =========================
  useEffect(()=>{

    const channel = supabase
      .channel("realtime-user")

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
  // LOADING
  // =========================
  if(loading){

    return(

      <AuthGuard allowedRole="masyarakat">

        <DashboardLayout role="masyarakat">

          <div
            className="
              bg-white
              p-6
              rounded-2xl
              shadow
            "
          >

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

          <h1
            className="
              text-2xl
              md:text-3xl
              font-bold
              text-gray-800
            "
          >

            Dashboard Masyarakat

          </h1>

          <p className="text-gray-500 mt-1">

            Informasi antrian terbaru anda

          </p>

        </div>

        {/* BELUM ADA ANTRIAN */}

        {
          !antrian && (

            <div
              className="
                bg-white
                p-6
                rounded-2xl
                shadow
              "
            >

              <h1
                className="
                  text-xl
                  font-bold
                  text-gray-800
                "
              >

                Belum Ada Antrian

              </h1>

              <p className="text-gray-500 mt-2">

                Silahkan ambil antrian terlebih dahulu

              </p>

            </div>

          )
        }

        {/* MENUNGGU VERIFIKASI FO */}

        {
          antrian?.status === "verifikasi"
          && (

            <div
              className="
                bg-yellow-100
                border
                border-yellow-300
                p-6
                rounded-2xl
                shadow
              "
            >

              <h1
                className="
                  text-2xl
                  font-bold
                  text-yellow-800
                  mb-3
                "
              >

                Menunggu Verifikasi Dokumen

              </h1>

              <p
                className="
                  text-yellow-700
                  text-lg
                "
              >

                Silahkan menuju Front Office
                untuk pengecekan dokumen.

              </p>

            </div>

          )
        }

        {/* DOKUMEN DITOLAK */}

        {
          antrian?.status === "ditolak"
          && (

            <div
              className="
                bg-red-100
                border
                border-red-300
                p-6
                rounded-2xl
                shadow
              "
            >

              <h1
                className="
                  text-2xl
                  font-bold
                  text-red-800
                  mb-3
                "
              >

                Dokumen Ditolak

              </h1>

              <p
                className="
                  text-red-700
                  text-lg
                "
              >

                Dokumen anda belum lengkap.
                Silahkan lengkapi berkas
                dan ambil antrian kembali.

              </p>

            </div>

          )
        }

        {/* SUDAH DAPAT ANTRIAN */}

        {
          antrian?.nomor_antrian
          &&

          antrian?.status !== "ditolak"
          && (

            <div
              className="
                bg-white
                rounded-2xl
                shadow
                overflow-hidden
              "
            >

              {/* HEADER CARD */}

              <div
                className="
                  bg-blue-600
                  p-6
                  text-white
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-3
                  "
                >

                  <div>

                    <h1
                      className="
                        text-xl
                        md:text-2xl
                        font-bold
                      "
                    >

                      Nomor Antrian

                    </h1>

                    <p className="mt-1 opacity-90">

                      Silahkan menunggu panggilan

                    </p>

                  </div>

                  <span
                    className="
                      bg-white/20
                      px-4
                      py-2
                      rounded-full
                      text-sm
                      font-medium
                      w-fit
                    "
                  >

                    {antrian.status}

                  </span>

                </div>

              </div>

              {/* BODY CARD */}

              <div className="p-6">

                <div
                  className="
                    text-center
                    mb-8
                  "
                >

                  <h1
                    className="
                      text-5xl
                      md:text-7xl
                      font-bold
                      text-blue-700
                    "
                  >

                    {antrian.nomor_antrian}

                  </h1>

                </div>

                <div
                  className="
                    grid
                    md:grid-cols-3
                    gap-4
                  "
                >

                  {/* LAYANAN */}

                  <div
                    className="
                      bg-gray-50
                      p-5
                      rounded-xl
                    "
                  >

                    <p className="text-gray-500">

                      Layanan

                    </p>

                    <h1
                      className="
                        text-lg
                        font-bold
                        mt-2
                      "
                    >

                      {
                        antrian.layanans
                        ?.nama_layanan
                      }

                    </h1>

                  </div>

                  {/* LOKET */}

                  <div
                    className="
                      bg-gray-50
                      p-5
                      rounded-xl
                    "
                  >

                    <p className="text-gray-500">

                      Loket Tujuan

                    </p>

                    <h1
                      className="
                        text-lg
                        font-bold
                        mt-2
                      "
                    >

                      {antrian.loket}

                    </h1>

                  </div>

                  {/* STATUS */}

                  <div
                    className="
                      bg-gray-50
                      p-5
                      rounded-xl
                    "
                  >

                    <p className="text-gray-500">

                      Status

                    </p>

                    <h1
                      className="
                        text-lg
                        font-bold
                        mt-2
                      "
                    >

                      {antrian.status}

                    </h1>

                  </div>

                </div>

              </div>

            </div>

          )
        }

      </DashboardLayout>

    </AuthGuard>
  )
}