
"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import { supabase }
from "../../../../lib/supabaseClient"

import DashboardLayout
from "../../../components/layouts/DashboardLayout"

import AuthGuard
from "../../../components/guards/AuthGuard"

export default function AmbilAntrianPage(){

  const router = useRouter()

  const [layanans,setLayanans]
    = useState([])

  const [userData,setUserData]
    = useState(null)

  const [layananId,setLayananId]
    = useState("")

  const [loading,setLoading]
    = useState(false)

  // =========================
  // LOAD DATA
  // =========================
  useEffect(()=>{

    getUser()

    getLayanans()

  },[])

  // =========================
  // GET USER
  // =========================
  async function getUser(){

    const {
      data:{session}
    } = await supabase.auth.getSession()

    if(!session) return

    const { data,error } =
      await supabase

      .from("users")

      .select("*")

      .eq("id",session.user.id)

      .single()

    if(error){

      console.log(error)

      return
    }

    setUserData(data)
  }

  // =========================
  // GET LAYANAN
  // =========================
  async function getLayanans(){

    const { data,error } =
      await supabase

      .from("layanans")

      .select("*")

      .order("nama_layanan")

    if(error){

      console.log(error)

      return
    }

    setLayanans(data || [])
  }

  // =========================
  // GENERATE NOMOR
  // =========================
  async function generateNomorAntrian(
    kode
  ){

    const today =
      new Date()
      .toISOString()
      .split("T")[0]

    const { data } =
      await supabase

      .from("antrians")

      .select("id")

      .like(
        "nomor_antrian",
        `${kode}-%`
      )

      .eq(
        "tanggal_antrian",
        today
      )

    const nomorUrut = String(

      (data?.length || 0) + 1

    ).padStart(3,"0")

    return `${kode}-${nomorUrut}`
  }

  // =========================
  // SUBMIT
  // =========================
  async function handleSubmit(e){

    e.preventDefault()

    if(loading) return

    setLoading(true)

    try{

      const {
        data:{session}
      } = await supabase.auth.getSession()

      if(!session){

        alert(
          "Session login tidak ditemukan"
        )

        setLoading(false)

        return
      }

      const user = session.user

      // =========================
      // CEK ANTRIAN AKTIF
      // =========================
      const { data:existing } =
        await supabase

        .from("antrians")

        .select("*")

        .eq("user_id",user.id)

        .in("status",[

          "menunggu",

          "dipanggil",

          "diproses",

          "verifikasi"

        ])

      if(existing?.length > 0){

        alert(
          "Masih ada antrian aktif"
        )

        setLoading(false)

        return
      }

      // =========================
      // DATA LAYANAN
      // =========================
      const { data:layanan } =
        await supabase

        .from("layanans")

        .select("*")

        .eq("id",layananId)

        .single()

      if(!layanan){

        alert(
          "Layanan tidak ditemukan"
        )

        setLoading(false)

        return
      }

      // =========================
      // VARIABLE
      // =========================
      let loket = ""

      let kodeAntrian = ""

      let status = "menunggu"

      let perluVerifikasi = false

      let statusDokumen = null

      // =========================
      // MAPPING LAYANAN
      // =========================
      if(
        layanan.nama_layanan
        === "IKD"
      ){

        loket = "Loket 1"

        kodeAntrian = "IK"
      }

      else if(
        layanan.nama_layanan
        === "Cetak KTP"
      ){

        loket = "Loket 2"

        kodeAntrian = "CT"
      }

      else if(
        layanan.nama_layanan
        === "KIA"
      ){

        loket = "Loket 2"

        kodeAntrian = "KI"
      }

      else if(
        layanan.nama_layanan
        === "E-Office"
      ){

        loket = "Loket 4"

        kodeAntrian = "EO"
      }

      else if(
        layanan.nama_layanan
        === "Perekaman KTP"
      ){

        loket = "Loket 9"

        kodeAntrian = "PR"
      }

      else{

        loket = "FO"

        status = "verifikasi"

        perluVerifikasi = true

        statusDokumen = "pending"
      }

      // =========================
      // GENERATE NOMOR
      // =========================
      let nomorAntrian = null

      if(!perluVerifikasi){

        nomorAntrian =
          await generateNomorAntrian(
            kodeAntrian
          )
      }

      // =========================
      // EXPIRED
      // =========================
      const expiredAt =
        new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString()

      // =========================
      // FORMAT ALAMAT
      // =========================
      const alamatLengkap = `

Kecamatan ${userData?.kecamatan},
Nagari ${userData?.nagari},
Jorong ${userData?.jorong}

      `.trim()

      // =========================
      // INSERT DATABASE
      // =========================
      const { error } =
        await supabase

        .from("antrians")

        .insert([{

          user_id:user.id,

          layanan_id:layananId,

          nomor_antrian:
            nomorAntrian,

          nama_pemohon:
            userData?.nama_lengkap,

          jenis_kelamin:
            userData?.jenis_kelamin,

          nomor_hp:
            userData?.nomor_hp,

          alamat:
            alamatLengkap,
             // ======================
    // ALAMAT TERPISAH
    // ======================
    kecamatan:
      userData?.kecamatan,

    nagari:
      userData?.nagari,

    jorong:
      userData?.jorong,

          status:status,

          perlu_verifikasi:
            perluVerifikasi,

          status_dokumen:
            statusDokumen,

          loket:loket,

          expired_at:
            expiredAt

        }])

      if(error){

        alert(error.message)

        setLoading(false)

        return
      }

      // =========================
      // ALERT
      // =========================
      if(perluVerifikasi){

        alert(
          "Silahkan menuju Front Office"
        )

      }else{

        alert(

`Nomor antrian Anda:

${nomorAntrian}

Silahkan menuju ${loket}`

        )
      }

      // =========================
      // RESET
      // =========================
      setLayananId("")

      // =========================
      // REDIRECT
      // =========================
      router.push("/user/dashboard")

    }catch(err){

      console.log(err)

      alert("Terjadi kesalahan")

    }finally{

      setLoading(false)
    }
  }

  return(

    <AuthGuard allowedRole="masyarakat">

      <DashboardLayout role="masyarakat">

        <div className="
          min-h-[80vh]
          flex
          items-center
          justify-center
          px-4
          py-6
        ">

          <div className="
            w-full
            max-w-xl
            bg-white
            rounded-[30px]
            border
            border-gray-100
            shadow-sm
            overflow-hidden
          ">

            {/* HEADER */}

            <div className="
              bg-gradient-to-r
              from-blue-600
              to-blue-500
              px-6
              sm:px-8
              py-8
              text-white
            ">

              <div className="
                flex
                items-center
                justify-center
                mb-4
              ">

                <div className="
                  w-16
                  h-16
                  rounded-full
                  bg-white/20
                  flex
                  items-center
                  justify-center
                  text-3xl
                  backdrop-blur-sm
                ">

                  🎫

                </div>

              </div>

              <h1 className="
                text-2xl
                sm:text-3xl
                font-bold
                text-center
              ">

                Ambil Antrian

              </h1>

              <p className="
                text-blue-100
                text-center
                mt-2
                text-sm
                sm:text-base
              ">

                Pilih layanan untuk mendapatkan nomor antrian

              </p>

            </div>

            {/* CONTENT */}

            <div className="
              p-5
              sm:p-8
            ">

              {/* USER INFO */}

              <div className="
                bg-blue-50
                border
                border-blue-100
                rounded-2xl
                p-4
                mb-6
              ">

                <p className="
                  text-sm
                  text-blue-700
                  font-medium
                ">

                  Data pemohon otomatis diambil dari akun pengguna.

                </p>

                <h2 className="
                  mt-2
                  text-lg
                  font-bold
                  text-gray-800
                ">

                  {userData?.nama_lengkap}

                </h2>

                <p className="
                  text-sm
                  text-gray-500
                  mt-1
                ">

                  NIK:
                  {" "}
                  {userData?.nik}

                </p>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                <div>

                  <label className="
                    block
                    mb-3
                    text-sm
                    font-semibold
                    text-gray-700
                  ">

                    Jenis Layanan

                  </label>

                  <select
                    value={layananId}

                    onChange={(e)=>
                      setLayananId(
                        e.target.value
                      )
                    }

                    className="
                      w-full
                      h-[56px]
                      rounded-2xl
                      border
                      border-gray-300
                      px-4
                      bg-white
                      text-gray-700
                      outline-none
                      transition
                      focus:ring-4
                      focus:ring-blue-100
                      focus:border-blue-500
                    "

                    required
                  >

                    <option value="">
                      Pilih layanan
                    </option>

                    {
                      layanans.map((item)=>(

                        <option
                          key={item.id}
                          value={item.id}
                        >

                          {item.nama_layanan}

                        </option>

                      ))
                    }

                  </select>

                </div>

                {/* BUTTON */}

                <button
                  disabled={
                    loading || !layananId
                  }

                  className="
                    w-full
                    h-[56px]
                    rounded-2xl
                    bg-blue-600
                    hover:bg-blue-700
                    disabled:bg-gray-400
                    transition
                    text-white
                    font-semibold
                    text-base
                    shadow-sm
                  "
                >

                  {
                    loading
                      ? "Memproses..."
                      : "Ambil Antrian"
                  }

                </button>

              </form>

            </div>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )
}
