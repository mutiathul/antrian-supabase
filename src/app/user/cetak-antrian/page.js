"use client"

import { useEffect, useState }
from "react"

import { supabase }
from "../../../../lib/supabaseClient"

import QRCode
from "react-qr-code"

export default function CetakAntrianPage(){

  const [antrian,setAntrian]
    = useState(null)

  useEffect(()=>{

    getAntrian()

  },[])

  async function getAntrian(){

    const {
      data:{session}
    } = await supabase.auth.getSession()

    if(!session) return

    const today =
      new Date()
      .toISOString()
      .split("T")[0]

    const { data } =
      await supabase

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

      .order(
        "created_at",
        {
          ascending:false
        }
      )

      .limit(1)

      .single()

    setAntrian(data)
  }

  function printTicket(){

    window.print()
  }

  if(!antrian){

    return(

      <div className="p-10">

        Data antrian tidak ditemukan

      </div>
    )
  }

  return(

    <div className="flex justify-center p-5">

      <div
        className="
          bg-white
          border
          p-5
          w-[300px]
          text-center
        "
      >

        <h1 className="font-bold">

          DISDUKCAPIL

        </h1>

        <p>

          Kabupaten Sijunjung

        </p>

        <hr className="my-3"/>

        <p>

          {
            antrian.layanans
            ?.nama_layanan
          }

        </p>

        <h1
          className="
            text-5xl
            font-bold
            my-4
          "
        >

          {
            antrian.nomor_antrian
          }

        </h1>

        <QRCode
          size={120}
          value={JSON.stringify({
            id:antrian.id,
            nomor:
              antrian.nomor_antrian
          })}
        />

        <p className="mt-4 text-sm">

          {
            new Date(
              antrian.created_at
            ).toLocaleString(
              "id-ID"
            )
          }

        </p>

        <button
          onClick={printTicket}
          className="
            mt-5
            w-full
            bg-blue-600
            text-white
            py-3
            rounded
          "
        >

          Cetak

        </button>

      </div>

    </div>
  )
}