"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function AmbilAntrianPage() {

  const [layanans, setLayanans] = useState([])

  const [userData, setUserData] = useState(null)

  const [layananId, setLayananId] = useState("")

  const [jk, setJk] = useState("")

  const [hp, setHp] = useState("")

  const [alamat, setAlamat] = useState("")

  const [loading, setLoading] = useState(false)

  const router = useRouter()

  // =========================
  // GET DATA AWAL
  // =========================
  useEffect(() => {

    getLayanans()

    getUser()

  }, [])

  // =========================
  // GET USER
  // =========================
  async function getUser() {

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) return

    const { data } = await supabase

      .from("users")

      .select("*")

      .eq("id", session.user.id)

      .single()

    setUserData(data)
  }

  // =========================
  // GET LAYANAN
  // =========================
  async function getLayanans() {

    const { data } = await supabase

      .from("layanans")

      .select("*")

      .order("nama_layanan")

    setLayanans(data || [])
  }

  // =========================
  // GENERATE NOMOR ANTRIAN
  // =========================
 async function generateNomorAntrian(
  kode
){

  const today =
    new Date()
    .toISOString()
    .split("T")[0]

  // =========================
  // HITUNG BERDASARKAN KODE
  // =========================
  const { data } = await supabase

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

        alert("Session login tidak ditemukan")

        setLoading(false)

        return
      }

      const user = session.user

      // =========================
      // CEK ANTRIAN AKTIF
      // =========================
      const { data: existing } =
        await supabase

        .from("antrians")

        .select("*")

        .eq("user_id", user.id)

        .in("status", [

          "menunggu",

          "dipanggil",

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
      // AMBIL DATA LAYANAN
      // =========================
      const { data: layanan } =
        await supabase

        .from("layanans")

        .select("*")

        .eq("id", layananId)

        .single()

      if(!layanan){

        alert("Layanan tidak ditemukan")

        setLoading(false)

        return
      }

      // =========================
      // VARIABLE
      // =========================
      let loket = ""

      let perluVerifikasi = false

      let nomorAntrian = null

      let status = "menunggu"

      let statusDokumen = null

      let kodeAntrian = ""

     // =========================
// IKD
// =========================
if(
  layanan.nama_layanan
  === "IKD"
){

  loket = "Loket 1"

  kodeAntrian = "IK"
}

// =========================
// CETAK KTP
// =========================
else if(
  layanan.nama_layanan
  === "Cetak KTP"
){

  loket = "Loket 2"

  kodeAntrian = "CT"
}

// =========================
// KIA
// =========================
else if(
  layanan.nama_layanan
  === "KIA"
){

  loket = "Loket 2"

  kodeAntrian = "KI"
}

// =========================
// E-OFFICE
// =========================
else if(
  layanan.nama_layanan
  === "E-Office"
){

  loket = "Loket 4"

  kodeAntrian = "EO"
}

// =========================
// PEREKAMAN KTP
// =========================
else if(
  layanan.nama_layanan
  === "Perekaman KTP"
){

  loket = "Loket 9"

  kodeAntrian = "PR"
}

// =========================
// LAYANAN FO
// =========================
else{

  perluVerifikasi = true

  loket = "FO"

  status = "verifikasi"

  statusDokumen = "pending"
}
      // =========================
      // GENERATE NOMOR
      // =========================
      if(!perluVerifikasi){

        nomorAntrian =
          await generateNomorAntrian(
            kodeAntrian
          )
      }

      // =========================
      // EXPIRED 30 MENIT
      // =========================
      const expiredAt =
        new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString()

      // =========================
      // SIMPAN DATABASE
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
            userData.nama_lengkap,

          jenis_kelamin:jk,

          nomor_hp:hp,

          alamat:alamat,

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
          "Silahkan menuju Front Office untuk pengecekan dokumen"
        )

      }else{

        alert(

`Nomor antrian berhasil dibuat:

${nomorAntrian}

Silahkan menuju ${loket}`

        )
      }

      // =========================
      // RESET FORM
      // =========================
      setLayananId("")

      setJk("")

      setHp("")

      setAlamat("")

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

  return (

    <AuthGuard allowedRole="masyarakat">

      <DashboardLayout role="masyarakat">

        <div
          className="
            bg-white
            p-6
            rounded-2xl
            shadow
            w-full
            max-w-3xl
          "
        >

          <h1
            className="
              text-2xl
              md:text-3xl
              font-bold
              mb-6
            "
          >

            Ambil Antrian

          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* LAYANAN */}

            <div>

              <label className="block mb-2 font-medium">

                Jenis Layanan

              </label>

              <select
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                "
                value={layananId}
                onChange={(e)=>
                  setLayananId(e.target.value)
                }
                required
              >

                <option value="">
                  Pilih Layanan
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

            {/* NAMA */}

            <div>

              <label className="block mb-2 font-medium">

                Nama Pemohon

              </label>

              <input
                type="text"
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  bg-gray-100
                "
                value={
                  userData?.nama_lengkap || ""
                }
                readOnly
              />

            </div>

            {/* JK */}

            <div>

              <label className="block mb-2 font-medium">

                Jenis Kelamin

              </label>

              <select
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                "
                value={jk}
                onChange={(e)=>
                  setJk(e.target.value)
                }
                required
              >

                <option value="">
                  Pilih Jenis Kelamin
                </option>

                <option value="Laki-laki">
                  Laki-laki
                </option>

                <option value="Perempuan">
                  Perempuan
                </option>

              </select>

            </div>

            {/* HP */}

            <div>

              <label className="block mb-2 font-medium">

                Nomor HP

              </label>

              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                "
                value={hp}
                onChange={(e)=>
                  setHp(e.target.value)
                }
                required
              />

            </div>

            {/* ALAMAT */}

            <div>

              <label className="block mb-2 font-medium">

                Alamat

              </label>

              <textarea
                rows="4"
                placeholder="Masukkan alamat lengkap"
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                "
                value={alamat}
                onChange={(e)=>
                  setAlamat(e.target.value)
                }
                required
              />

            </div>

            {/* BUTTON */}

            <button
              disabled={loading}
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                text-white
                p-3
                rounded-lg
                font-semibold
                transition
                disabled:bg-gray-400
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

      </DashboardLayout>

    </AuthGuard>
  )
}