"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../../lib/supabaseClient"

import DashboardLayout from "../../../components/layouts/DashboardLayout"

import AuthGuard from "../../../components/guards/AuthGuard"

export default function LayananPage() {

  const [layanans, setLayanans] = useState([])

  const [nama, setNama] = useState("")
  const [kode, setKode] = useState("")
  const [limit, setLimit] = useState(50)

  const [editId, setEditId] = useState(null)

  useEffect(() => {

    getLayanan()

  }, [])

  // =========================
  // GET DATA
  // =========================
  async function getLayanan() {

    const { data, error } = await supabase
      .from("layanans")
      .select("*")
      .order("created_at", {
        ascending: false
      })

    if(error){

      alert(error.message)
      return
    }

    setLayanans(data || [])
  }

  // =========================
  // RESET FORM
  // =========================
  function resetForm(){

    setNama("")
    setKode("")
    setLimit(50)

    setEditId(null)
  }

  // =========================
  // TAMBAH / UPDATE
  // =========================
  async function tambahLayanan(e) {

    e.preventDefault()

    // VALIDASI
    if(!nama || !kode){

      alert("Semua field wajib diisi")
      return
    }

    // =========================
    // UPDATE
    // =========================
    if(editId){

      const { error } = await supabase
        .from("layanans")
        .update({
          nama_layanan: nama,
          kode_layanan: kode,
          limit_harian: limit
        })
        .eq("id", editId)

      if(error){

        alert(error.message)
        return
      }

      alert("Layanan berhasil diupdate")

      resetForm()

      getLayanan()

      return
    }

    // =========================
    // INSERT
    // =========================
    const { error } = await supabase
      .from("layanans")
      .insert([
        {
          nama_layanan: nama,
          kode_layanan: kode,
          limit_harian: limit
        }
      ])

    if(error){

      alert(error.message)
      return
    }

    alert("Layanan berhasil ditambahkan")

    resetForm()

    getLayanan()
  }

  // =========================
  // EDIT
  // =========================
  function editLayanan(item){

    setNama(item.nama_layanan)

    setKode(item.kode_layanan)

    setLimit(item.limit_harian)

    setEditId(item.id)
  }

  // =========================
  // HAPUS
  // =========================
  async function hapusLayanan(id){

    const konfirmasi = confirm(
      "Yakin ingin menghapus layanan?"
    )

    if(!konfirmasi) return

    const { error } = await supabase
      .from("layanans")
      .delete()
      .eq("id", id)

    if(error){

      alert(error.message)
      return
    }

    alert("Layanan berhasil dihapus")

    getLayanan()
  }

  return (

    <AuthGuard allowedRole="admin">

      <DashboardLayout role="admin">

        {/* FORM */}

        <div className="bg-white p-5 rounded-lg shadow mb-5">

          <h1 className="text-2xl font-bold mb-5">

            {
              editId
                ? "Edit Layanan"
                : "Tambah Layanan"
            }

          </h1>

          <form
            onSubmit={tambahLayanan}
            className="grid md:grid-cols-4 gap-3"
          >

            {/* NAMA */}

            <input
              type="text"
              placeholder="Nama Layanan"
              className="border p-3 rounded"
              value={nama}
              onChange={(e)=>setNama(e.target.value)}
              required
            />

            {/* KODE */}

            <input
              type="text"
              placeholder="Kode Layanan"
              className="border p-3 rounded"
              value={kode}
              onChange={(e)=>setKode(e.target.value)}
              required
            />

            {/* LIMIT */}

            <input
              type="number"
              placeholder="Limit Harian"
              className="border p-3 rounded"
              value={limit}
              onChange={(e)=>setLimit(e.target.value)}
              required
            />

            {/* BUTTON */}

            <button
              className="bg-blue-600 text-white rounded p-3"
            >

              {
                editId
                  ? "Update Layanan"
                  : "Tambah"
              }

            </button>

          </form>

          {/* BUTTON CANCEL */}

          {
            editId && (

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-5 py-3 rounded mt-3"
              >
                Batal Edit
              </button>

            )
          }

        </div>

        {/* TABLE */}

        <div className="bg-white p-5 rounded-lg shadow">

          <h1 className="text-2xl font-bold mb-5">
            Data Layanan
          </h1>

          <div className="overflow-x-auto">

            <table className="w-full border">

              <thead className="bg-gray-100">

                <tr>

                  <th className="border p-3">
                    Nama
                  </th>

                  <th className="border p-3">
                    Kode
                  </th>

                  <th className="border p-3">
                    Limit
                  </th>

                  <th className="border p-3">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  layanans.length > 0 ? (

                    layanans.map((item)=>(

                      <tr key={item.id}>

                        {/* NAMA */}

                        <td className="border p-3">

                          {item.nama_layanan}

                        </td>

                        {/* KODE */}

                        <td className="border p-3 font-bold">

                          {item.kode_layanan}

                        </td>

                        {/* LIMIT */}

                        <td className="border p-3">

                          {item.limit_harian}

                        </td>

                        {/* AKSI */}

                        <td className="border p-3">

                          <div className="flex flex-wrap gap-2">

                            <button
                              onClick={()=>editLayanan(item)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                              Edit
                            </button>

                            <button
                              onClick={()=>hapusLayanan(item.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                              Hapus
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="4"
                        className="text-center p-5"
                      >
                        Belum ada layanan
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