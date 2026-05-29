"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function AmbilAntrianPage() {

  const router = useRouter()

  const [layanans, setLayanans] = useState([])

  const [userData, setUserData] = useState(null)

  const [layananId, setLayananId] = useState("")

  const [loading, setLoading] = useState(false)

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {

    getUser()

    getLayanans()

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
  ) {

    const today =
      new Date()
      .toISOString()
      .split("T")[0]

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

    ).padStart(3, "0")

    return `${kode}-${nomorUrut}`
  }

  // =========================
  // SUBMIT
  // =========================
  async function handleSubmit(e) {

    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {

      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {

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
            "diproses",
            "verifikasi"
          ])

      if (existing?.length > 0) {

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

      if (!layanan) {

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
      if (
        layanan.nama_layanan
        === "IKD"
      ) {

        loket = "Loket 1"

        kodeAntrian = "IK"
      }

      // =========================
      // CETAK KTP
      // =========================
      else if (
        layanan.nama_layanan
        === "Cetak KTP"
      ) {

        loket = "Loket 2"

        kodeAntrian = "CT"
      }

      // =========================
      // KIA
      // =========================
      else if (
        layanan.nama_layanan
        === "KIA"
      ) {

        loket = "Loket 2"

        kodeAntrian = "KI"
      }

      // =========================
      // E-OFFICE
      // =========================
      else if (
        layanan.nama_layanan
        === "E-Office"
      ) {

        loket = "Loket 4"

        kodeAntrian = "EO"
      }

      // =========================
      // PEREKAMAN KTP
      // =========================
      else if (
        layanan.nama_layanan
        === "Perekaman KTP"
      ) {

        loket = "Loket 9"

        kodeAntrian = "PR"
      }

      // =========================
      // LAYANAN FO
      // =========================
      else {

        perluVerifikasi = true

        loket = "FO"

        status = "verifikasi"

        statusDokumen = "pending"
      }

      // =========================
      // GENERATE NOMOR
      // =========================
      if (!perluVerifikasi) {

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
      // FORMAT ALAMAT
      // =========================
      const alamatLengkap = `Kecamatan ${userData?.kecamatan}, Nagari ${userData?.nagari}, Jorong ${userData?.jorong}`

      // =========================
      // SIMPAN DATABASE
      // =========================
      const { error } =
        await supabase

          .from("antrians")

          .insert([{

            user_id: user.id,

            layanan_id: layananId,

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

            status: status,

            perlu_verifikasi:
              perluVerifikasi,

            status_dokumen:
              statusDokumen,

            loket: loket,

            expired_at:
              expiredAt

          }])

      if (error) {

        alert(error.message)

        setLoading(false)

        return
      }

      // =========================
      // ALERT
      // =========================
      if (perluVerifikasi) {

        alert(
          "Silahkan menuju Front Office untuk pengecekan dokumen"
        )

      } else {

        alert(

`Nomor antrian berhasil dibuat:

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

    } catch (err) {

      console.log(err)

      alert("Terjadi kesalahan")

    } finally {

      setLoading(false)
    }
  }

  return (

    <AuthGuard allowedRole="masyarakat">

      <DashboardLayout role="masyarakat">

        <div className="flex justify-center px-3 sm:px-5 py-4">

          <div
            className="
              w-full
              max-w-5xl
              bg-white
              rounded-[28px]
              border
              border-gray-100
              shadow-sm
              overflow-hidden
            "
          >

            {/* HEADER */}

            <div
              className="
                bg-gradient-to-r
                from-blue-600
                to-blue-500
                px-5
                sm:px-8
                py-7
                text-white
              "
            >

              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  font-bold
                "
              >

                Ambil Antrian

              </h1>

              <p
                className="
                  mt-2
                  text-blue-100
                  text-sm
                  sm:text-base
                "
              >

                Silahkan pilih jenis layanan untuk mengambil nomor antrian

              </p>

            </div>

            {/* CONTENT */}

            <div
              className="
                p-4
                sm:p-7
                lg:p-8
              "
            >

              <form
                onSubmit={handleSubmit}
                className="space-y-7"
              >

                {/* LAYANAN */}

                <div>

                  <label
                    className="
                      block
                      mb-3
                      text-sm
                      font-semibold
                      text-gray-700
                    "
                  >

                    Jenis Layanan

                  </label>

                  <select
                    value={layananId}
                    onChange={(e) =>
                      setLayananId(e.target.value)
                    }
                    className="
                      w-full
                      h-[54px]
                      rounded-2xl
                      border
                      border-gray-300
                      bg-white
                      px-4
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
                      Pilih Layanan
                    </option>

                    {
                      layanans.map((item) => (

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

                {/* DATA DIRI */}

                <div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      mb-5
                    "
                  >

                    <div>

                      <h2
                        className="
                          text-lg
                          font-bold
                          text-gray-800
                        "
                      >

                        Data Pemohon

                      </h2>

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mt-1
                        "
                      >

                        Data otomatis diambil dari akun pengguna

                      </p>

                    </div>

                  </div>

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-5
                    "
                  >

                    <InputItem
                      label="NIK"
                      value={userData?.nik}
                    />

                    <InputItem
                      label="Nama Lengkap"
                      value={userData?.nama_lengkap}
                    />

                    <InputItem
                      label="Email"
                      value={userData?.email}
                    />

                    <InputItem
                      label="Nomor HP"
                      value={userData?.nomor_hp}
                    />

                    <InputItem
                      label="Jenis Kelamin"
                      value={userData?.jenis_kelamin}
                    />

                    <InputItem
                      label="Pekerjaan"
                      value={userData?.pekerjaan}
                    />

                    <InputItem
                      label="Kecamatan"
                      value={userData?.kecamatan}
                    />

                    <InputItem
                      label="Nagari"
                      value={userData?.nagari}
                    />

                  </div>

                  {/* JORONG */}

                  <div className="mt-5">

                    <InputItem
                      label="Jorong"
                      value={userData?.jorong}
                    />

                  </div>

                </div>

                {/* BUTTON */}

                <div className="pt-2">

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
                      text-white
                      font-semibold
                      text-base
                      transition
                      shadow-sm
                    "
                  >

                    {
                      loading
                        ? "Memproses..."
                        : "Ambil Antrian"
                    }

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )
}

// =========================
// INPUT ITEM
// =========================
function InputItem({

  label,
  value

}) {

  return (

    <div>

      <label
        className="
          block
          mb-2
          text-sm
          font-medium
          text-gray-700
        "
      >

        {label}

      </label>

      <input
        type="text"
        value={value || ""}
        readOnly
        className="
          w-full
          h-[52px]
          rounded-2xl
          border
          border-gray-200
          bg-gray-50
          px-4
          text-gray-700
          text-sm
          outline-none
        "
      />

    </div>
  )
}