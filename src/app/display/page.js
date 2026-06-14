"use client"

import { useEffect, useState } from "react"

import { supabase }
from "../../../lib/supabaseClient"

export default function DisplayPage(){

  const [antrians,setAntrians]
    = useState([])

  const [now,setNow]
    = useState(null)

  // =========================
  // JAM DIGITAL
  // =========================
  useEffect(()=>{

    const interval =
      setInterval(()=>{

        setNow(
          new Date()
        )

      },1000)

    return ()=>clearInterval(interval)

  },[])

  // =========================
  // LOAD DATA
  // =========================
  // async function loadData(){

  //   const today =
  //     new Date()
  //     .toISOString()
  //     .split("T")[0]

  //   const { data,error }
  //     = await supabase

  //     .from("display_antrian")

  //     // .select(`
  //     //   *,
  //     //   layanans(
  //     //     nama_layanan,
  //     //     kode_layanan
  //     //   )
  //     // `)
  //     .select("*")

  //     .eq(
  //       "tanggal_antrian",
  //       today
  //     )

  //     .order(
  //       "created_at",
  //       {
  //         ascending:true
  //       }
  //     )

  //   if(error){

  //     console.log(error)

  //     return
  //   }

  //   console.log(data)

  //   setAntrians(data || [])
  // }

//  async function loadData() {
//   const { data, error } = await supabase
//     .from("display_antrian")
//     .select("*")
//     .order("created_at", { ascending: true })

//   if (error) {
//     console.log(error)
//     return
//   }

//   console.log("ALL DATA:", data)

//   setAntrians(data || [])
// }

async function loadData() {
  const now = new Date()

  // WIB offset (Indonesia +7)
  const offset = 7 * 60 * 60 * 1000

  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const wibNow = new Date(utc + offset)

  const start = new Date(wibNow)
  start.setHours(0, 0, 0, 0)

  const end = new Date(wibNow)
  end.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from("display_antrian")
    .select("*")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: true })

  if (error) {
    console.log(error)
    return
  }

  setAntrians(data || [])
}
console.log("STATUS LIST:", antrians.map(x => x.status))

  // =========================
  // AUTO REFRESH 5 DETIK
  // =========================
  useEffect(()=>{

    loadData()

    const interval =
      setInterval(()=>{

        loadData()

      },5000)

    return ()=>clearInterval(interval)

  },[])

  // =========================
  // SEDANG DIPROSES
  // =========================
  const sedangDiproses =

    antrians.find(
      item =>
        item.status === "diproses"
    )

  // =========================
  // ANTRIAN BERIKUTNYA
  // =========================
  const berikutnya =

    antrians

      .filter(
        item =>
          item.status === "menunggu"
      )

      .slice(0,10)

  // =========================
  // STATISTIK
  // =========================
  const total =
    antrians.length

  const menunggu =
    antrians.filter(
      x => x.status === "menunggu"
    ).length

  const diproses =
    antrians.filter(
      x => x.status === "diproses"
    ).length

  const selesai =
    antrians.filter(
      x => x.status === "selesai"
    ).length

  const batal =
    antrians.filter(
      x =>
        x.status === "dibatalkan"
        ||
        x.status === "ditolak"
    ).length

  // =========================
  // RINGKASAN LAYANAN
  // =========================
  const layananMap = {}

  antrians.forEach(item=>{

    // const nama =

    //   item.layanans
    //   ?.nama_layanan

    //   || "Lainnya"

     const nama =
  item.nama_layanan
  || "Lainnya"

    layananMap[nama] = {

      total:
        (layananMap[nama]?.total || 0)
        + 1,

      menunggu:
        (layananMap[nama]?.menunggu || 0)
        +
        (
          item.status === "menunggu"
          ? 1
          : 0
        ),

      selesai:
        (layananMap[nama]?.selesai || 0)
        +
        (
          item.status === "selesai"
          ? 1
          : 0
        )
    }

  })

  return(

    <div
      className="
        min-h-screen
        bg-slate-900
        text-white

        p-4
        md:p-6
        lg:p-8
      "
    >

      {/* HEADER */}

      <div className="text-center mb-8">

        <h1
          className="
            text-3xl
            md:text-4xl
            lg:text-5xl
            xl:text-6xl
            font-black
          "
        >

          SISTEM ANTRIAN

        </h1>

        <h2
          className="
            text-xl
            md:text-2xl
            lg:text-3xl
            text-blue-300
            mt-2
          "
        >

          DISDUKCAPIL

        </h2>

      </div>

      {/* SECTION UTAMA */}

      <div
        className="
          grid
          xl:grid-cols-2
          gap-6
          mb-6
        "
      >

        {/* DIPANGGIL */}

        <div
          className="
            bg-blue-700
            rounded-3xl
            p-8
            shadow-xl
          "
        >

          <h2
            className="
              text-center
              text-2xl
              lg:text-3xl
              font-bold
              mb-6
            "
          >

            SEDANG DIPANGGIL

          </h2>

          <div className="text-center">

            <h1
              className="
                text-5xl
                md:text-6xl
                lg:text-7xl
                xl:text-8xl
                2xl:text-9xl
                font-black
              "
            >

              {
                sedangDiproses
                ?.nomor_antrian
                || "-"
              }

            </h1>

            <p
              className="
                text-2xl
                md:text-3xl
                lg:text-4xl
                mt-4
              "
            >

              {
                sedangDiproses
                ?.loket
                || "-"
              }

            </p>

          </div>

        </div>

        {/* ANTRIAN MENUNGGU */}

        <div
          className="
            bg-slate-800
            rounded-3xl
            p-8
            shadow-xl
          "
        >

          <h2
            className="
              text-center
              text-2xl
              lg:text-3xl
              font-bold
              mb-6
            "
          >

            ANTRIAN BERIKUTNYA

          </h2>

          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >

            {
              berikutnya.map(item=>(

                <div
                  key={item.id}
                  className="
                    bg-slate-700
                    rounded-xl
                    p-4
                    text-center
                  "
                >

                  <h3
                    className="
                      text-2xl
                      lg:text-3xl
                      font-bold
                    "
                  >

                    {
                      item.nomor_antrian
                    }

                  </h3>

                </div>

              ))
            }

          </div>

        </div>

      </div>

      {/* STATISTIK */}

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-5
          gap-4
          mb-6
        "
      >

        <Card title="Total" value={total}/>
        <Card title="Menunggu" value={menunggu}/>
        <Card title="Diproses" value={diproses}/>
        <Card title="Selesai" value={selesai}/>
        <Card title="Batal" value={batal}/>

      </div>

      {/* RINGKASAN LAYANAN */}

      <div
        className="
          bg-slate-800
          rounded-3xl
          p-6
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            mb-6
          "
        >

          Ringkasan Pelayanan Hari Ini

        </h2>

        <div
          className="
            grid
            md:grid-cols-2
            xl:grid-cols-3
            gap-4
          "
        >

          {
            Object.entries(
              layananMap
            ).map(([nama,data])=>(

              <div
                key={nama}
                className="
                  bg-slate-700
                  rounded-xl
                  p-5
                "
              >

                <h3
                  className="
                    text-lg
                    font-bold
                  "
                >

                  {nama}

                </h3>

                <div className="mt-3 space-y-1">

                  <p>
                    Total :
                    <b> {data.total}</b>
                  </p>

                  <p>
                    Menunggu :
                    <b> {data.menunggu}</b>
                  </p>

                  <p>
                    Selesai :
                    <b> {data.selesai}</b>
                  </p>

                </div>

              </div>

            ))
          }

        </div>

      </div>

      {/* FOOTER */}

      <div
        className="
          mt-8
          flex
          flex-col
          lg:flex-row
          justify-between
          gap-4
          items-center
        "
      >

        <div
          className="
            text-blue-300
            text-lg
            w-full
          "
        >

          <marquee>

            Selamat datang di Disdukcapil •
            Pastikan dokumen lengkap sebelum menuju loket •
            Harap menunggu hingga nomor antrian dipanggil •
            Jaga ketertiban dan kenyamanan bersama

          </marquee>

        </div>

        <div
          className="
            text-xl
            md:text-2xl
            lg:text-3xl
            xl:text-4xl
            font-bold
          "
        >

         {
    now
      ? `${now.toLocaleTimeString("id-ID")} WIB`
      : "--:--:-- WIB"
  }

        </div>

      </div>

    </div>
  )
}

function Card({

  title,
  value

}){

  return(

    <div
      className="
        bg-slate-800
        rounded-2xl
        p-5
        text-center
      "
    >

      <p className="text-gray-300">

        {title}

      </p>

      <h1
        className="
          text-3xl
          md:text-4xl
          lg:text-5xl
          font-bold
          mt-2
        "
      >

        {value}

      </h1>

    </div>
  )
}