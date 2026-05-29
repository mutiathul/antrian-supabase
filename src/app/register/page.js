"use client"

import { useState, useEffect } from "react"

import Link from "next/link"

import { useRouter } from "next/navigation"

import { supabase }
from "../../../lib/supabaseClient"

import wilayah
from "../../../src/data/limapuluhkota.json"

export default function RegisterPage(){

  const router = useRouter()

  // =========================
  // STATE
  // =========================
  const [loading,setLoading]
    = useState(false)

  const [districts,setDistricts]
    = useState([])

  const [villages,setVillages]
    = useState([])

  const [form,setForm]
    = useState({

      nik:"",
      nama_lengkap:"",
      email:"",
      password:"",
      nomor_hp:"",
      jenis_kelamin:"",
      pekerjaan:"",
      kecamatan:"",
      nagari:"",
      jorong:""

    })

  // =========================
  // LOAD DISTRICTS
  // =========================
  useEffect(()=>{

    setDistricts(
      wilayah.districts || []
    )

  },[])

  // =========================
  // HANDLE CHANGE
  // =========================
  function handleChange(e){

    const {
      name,
      value
    } = e.target

    // =========================
    // NIK MAX 13
    // =========================
    if(name === "nik"){

      if(value.length > 13)
        return
    }

    // =========================
    // NO HP MAX 14
    // =========================
    if(name === "nomor_hp"){

      if(value.length > 14)
        return
    }

    setForm({

      ...form,

      [name]:value

    })
  }

  // =========================
  // HANDLE KECAMATAN
  // =========================
  function handleDistrict(e){

    const districtId =
      e.target.value

    const selectedDistrict =
      districts.find(
        item =>
          item.id === districtId
      )

    setVillages(
      selectedDistrict?.villages || []
    )

    setForm({

      ...form,

      kecamatan:
        selectedDistrict?.name || "",

      nagari:""

    })
  }

  // =========================
  // HANDLE NAGARI
  // =========================
  function handleVillage(e){

    const villageId =
      e.target.value

    const selectedVillage =
      villages.find(
        item =>
          item.id === villageId
      )

    setForm({

      ...form,

      nagari:
        selectedVillage?.name || ""

    })
  }

  // =========================
  // REGISTER
  // =========================
  async function handleRegister(e){

    e.preventDefault()

    if(loading) return

    setLoading(true)

    try{

      // =========================
      // VALIDASI
      // =========================
      if(form.nik.length !== 13){

        alert(
          "NIK harus 13 digit"
        )

        setLoading(false)

        return
      }

      if(form.nomor_hp.length > 14){

        alert(
          "Nomor HP maksimal 14 digit"
        )

        setLoading(false)

        return
      }

      // =========================
      // REGISTER AUTH
      // =========================
      const {
        data,
        error
      } = await supabase.auth.signUp({

        email:form.email,

        password:form.password

      })

      if(error){

        alert(error.message)

        setLoading(false)

        return
      }

      const userId =
        data.user.id

      // =========================
      // SIMPAN USERS
      // =========================
      const {
        error:insertError
      } = await supabase

        .from("users")

        .insert([{

          id:userId,

          nik:form.nik,

          nama_lengkap:
            form.nama_lengkap,

          email:form.email,

          nomor_hp:
            form.nomor_hp,

          jenis_kelamin:
            form.jenis_kelamin,

          pekerjaan:
            form.pekerjaan,

          kecamatan:
            form.kecamatan,

          nagari:
            form.nagari,

          jorong:
            form.jorong,

          role:"masyarakat"

        }])

      if(insertError){

        alert(insertError.message)

        setLoading(false)

        return
      }

      alert(
        "Registrasi berhasil"
      )

      router.push("/login")

    }catch(err){

      console.log(err)

      alert(
        "Terjadi kesalahan"
      )

    }finally{

      setLoading(false)
    }
  }

  return(

    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-blue-50
        via-white
        to-cyan-50
        flex
        items-center
        justify-center
        px-4
        py-10
      "
    >

      <div
        className="
          w-full
          max-w-5xl
          bg-white/90
          backdrop-blur
          rounded-3xl
          shadow-2xl
          overflow-hidden
          grid
          lg:grid-cols-2
        "
      >

        {/* LEFT */}

        <div
          className="
            hidden
            lg:flex
            flex-col
            justify-center
            bg-gradient-to-br
            from-blue-600
            to-cyan-500
            text-white
            p-10
          "
        >

          <h1
            className="
              text-4xl
              font-bold
              leading-tight
            "
          >

            Sistem
            <br />

            Antrian Online

          </h1>

          <p
            className="
              mt-5
              text-lg
              text-white/90
            "
          >

            Registrasi akun masyarakat
            untuk mengambil antrian
            layanan secara online.

          </p>

        </div>

        {/* RIGHT */}

        <div
          className="
            p-6
            md:p-10
          "
        >

          <div className="mb-8">

            <h1
              className="
                text-3xl
                font-bold
                text-gray-800
              "
            >

              Daftar Akun

            </h1>

            <p
              className="
                text-gray-500
                mt-2
              "
            >

              Lengkapi data berikut

            </p>

          </div>

          <form
            onSubmit={handleRegister}
            className="
              grid
              md:grid-cols-2
              gap-4
            "
          >

            {/* NIK */}

            <Input
              label="NIK"
              name="nik"
              value={form.nik}
              onChange={handleChange}
              placeholder="13 digit"
              type="number"
            />

            {/* NAMA */}

            <Input
              label="Nama Lengkap"
              name="nama_lengkap"
              value={form.nama_lengkap}
              onChange={handleChange}
              placeholder="Masukkan nama"
            />

            {/* EMAIL */}

            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@gmail.com"
              type="email"
            />

            {/* PASSWORD */}

            <Input
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              type="password"
            />

            {/* HP */}

            <Input
              label="Nomor HP"
              name="nomor_hp"
              value={form.nomor_hp}
              onChange={handleChange}
              placeholder="08xxxxxxxx"
              type="number"
            />

            {/* JK */}

            <div>

              <label
                className="
                  block
                  mb-2
                  font-medium
                  text-gray-700
                "
              >

                Jenis Kelamin

              </label>

              <select
                required
                name="jenis_kelamin"
                value={form.jenis_kelamin}
                onChange={handleChange}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  p-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
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

            {/* PEKERJAAN */}

            <Input
              label="Pekerjaan"
              name="pekerjaan"
              value={form.pekerjaan}
              onChange={handleChange}
              placeholder="Pekerjaan"
            />

            {/* KECAMATAN */}

            <div>

              <label
                className="
                  block
                  mb-2
                  font-medium
                  text-gray-700
                "
              >

                Kecamatan

              </label>

              <select
                required
                onChange={handleDistrict}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  p-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              >

                <option value="">
                  Pilih Kecamatan
                </option>

                {
                  districts.map((item)=>(

                    <option
                      key={item.id}
                      value={item.id}
                    >

                      {item.name}

                    </option>

                  ))
                }

              </select>

            </div>

            {/* NAGARI */}

            <div>

              <label
                className="
                  block
                  mb-2
                  font-medium
                  text-gray-700
                "
              >

                Nagari

              </label>

              <select
                required
                onChange={handleVillage}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  p-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              >

                <option value="">
                  Pilih Nagari
                </option>

                {
                  villages.map((item)=>(

                    <option
                      key={item.id}
                      value={item.id}
                    >

                      {item.name}

                    </option>

                  ))
                }

              </select>

            </div>

            {/* JORONG */}

            <div className="md:col-span-2">

              <Input
                label="Jorong"
                name="jorong"
                value={form.jorong}
                onChange={handleChange}
                placeholder="Masukkan jorong"
              />

            </div>

            {/* BUTTON */}

            <div className="md:col-span-2">

              <button
                disabled={loading}
                className="
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  transition
                  text-white
                  py-4
                  rounded-2xl
                  font-semibold
                  text-lg
                  disabled:bg-gray-400
                "
              >

                {
                  loading
                  ? "Memproses..."
                  : "Daftar Sekarang"
                }

              </button>

            </div>

          </form>

          {/* LOGIN */}

          <div className="text-center mt-6">

            <p className="text-gray-600">

              Sudah punya akun?

            </p>

            <Link
              href="/login"
              className="
                text-blue-600
                font-semibold
                hover:underline
              "
            >

              Masuk Sekarang

            </Link>

          </div>

        </div>

      </div>

    </div>
  )
}

// =========================
// INPUT
// =========================
function Input({

  label,
  ...props

}){

  return(

    <div>

      <label
        className="
          block
          mb-2
          font-medium
          text-gray-700
        "
      >

        {label}

      </label>

      <input
        {...props}
        required
        className="
          w-full
          border
          border-gray-300
          rounded-xl
          p-3
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />

    </div>
  )
}