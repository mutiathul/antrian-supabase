"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import DashboardLayout from "../../../components/layouts/DashboardLayout"
import AuthGuard from "../../../components/guards/AuthGuard"

export default function AmbilAntrianPage() {

  const [layanans, setLayanans] = useState([])
  const [userData, setUserData] = useState(null)
  const [layananId, setLayananId] = useState("")
  //const [nama, setNama] = useState("")
  const [jk, setJk] = useState("")
  const [hp, setHp] = useState("")
  const [alamat, setAlamat] = useState("")

  useEffect(() => {

     getLayanans()
  getUser()

  }, [])
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
  async function getLayanans() {

    const { data } = await supabase
      .from("layanans")
      .select("*")

    setLayanans(data || [])
  }

  async function handleSubmit(e) {

    e.preventDefault()

    // ambil session login
    const {
      data: { session }
    } = await supabase.auth.getSession()

    const user = session.user

    // cek antrian aktif
    const { data: existing } = await supabase
      .from("antrians")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["menunggu", "dipanggil"])

    if (existing.length > 0) {

      alert("Masih ada antrian aktif")
      return
    }

    // ambil layanan
    const { data: layanan } = await supabase
      .from("layanans")
      .select("*")
      .eq("id", layananId)
      .single()

    // hitung jumlah antrian hari ini
    const today = new Date().toISOString().split("T")[0]

    const { data: totalToday } = await supabase
      .from("antrians")
      .select("*")
      .eq("layanan_id", layananId)
      .eq("tanggal_antrian", today)

    const nomorUrut = String(
      (totalToday?.length || 0) + 1
    ).padStart(3, "0")

    const nomorAntrian =
      `${layanan.kode_layanan}-${nomorUrut}`

    // simpan antrian
    const { error } = await supabase
      .from("antrians")
      .insert([
        {
          user_id: user.id,
          layanan_id: layananId,
          nomor_antrian: nomorAntrian,
          nama_pemohon: userData.nama_lengkap,
          jenis_kelamin: jk,
          nomor_hp: hp,
          alamat: alamat,
          status: "menunggu"
        }
      ])

    if (error) {

      alert(error.message)
      return
    }

    alert(`Nomor antrian berhasil dibuat: ${nomorAntrian}`)

    // reset form
    setLayananId("")
    //setNama("")
    setJk("")
    setHp("")
    setAlamat("")
  }

  return (

    <AuthGuard allowedRole="masyarakat">

      <DashboardLayout role="masyarakat">

        <div className="bg-white p-6 rounded-lg shadow">

          <h1 className="text-2xl font-bold mb-5">
            Ambil Antrian
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <select
              className="w-full border p-3 rounded"
              value={layananId}
              onChange={(e)=>setLayananId(e.target.value)}
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

           <input
  type="text"
  className="w-full border p-3 rounded bg-gray-100"
  value={userData?.nama_lengkap || ""}
  readOnly
/>

            <select
              className="w-full border p-3 rounded"
              value={jk}
              onChange={(e)=>setJk(e.target.value)}
              required
            >
              <option value="">
                Jenis Kelamin
              </option>

              <option value="Laki-laki">
                Laki-laki
              </option>

              <option value="Perempuan">
                Perempuan
              </option>
            </select>

            <input
              type="text"
              placeholder="Nomor HP"
              className="w-full border p-3 rounded"
              value={hp}
              onChange={(e)=>setHp(e.target.value)}
              required
            />

            <textarea
              placeholder="Alamat"
              className="w-full border p-3 rounded"
              value={alamat}
              onChange={(e)=>setAlamat(e.target.value)}
              required
            />

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded"
            >
              Ambil Antrian
            </button>

          </form>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )
}