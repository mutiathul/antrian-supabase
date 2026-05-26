import Link from "next/link"

export default function HomePage(){

  return(

    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header
        className="
          bg-blue-700
          text-white
          px-6 py-4
          flex justify-between items-center
        "
      >

        <h1 className="text-2xl font-bold">

          Sistem Antrian Disdukcapil

        </h1>

        <div className="flex gap-3">

          <Link
            href="/login"
            className="
              bg-white text-blue-700
              px-4 py-2 rounded
              font-semibold
            "
          >
            Login
          </Link>

          <Link
            href="/register"
            className="
              bg-yellow-400 text-black
              px-4 py-2 rounded
              font-semibold
            "
          >
            Register
          </Link>

        </div>

      </header>

      {/* HERO */}

      <section
        className="
          max-w-7xl mx-auto
          px-6 py-20
          grid md:grid-cols-2 gap-10
          items-center
        "
      >

        {/* TEXT */}

        <div>

          <h1
            className="
              text-5xl font-bold
              text-gray-800
              leading-tight
              mb-6
            "
          >

            Sistem Antrian Online
            Disdukcapil

          </h1>

          <p
            className="
              text-lg text-gray-600
              mb-8
            "
          >

            Ambil nomor antrian secara online
            tanpa harus mengantri lama di kantor
            pelayanan Disdukcapil.

          </p>

          <div className="flex gap-4 flex-wrap">

            <Link
              href="/register"
              className="
                bg-blue-600 text-white
                px-6 py-3 rounded-lg
                font-semibold
              "
            >
              Ambil Antrian Sekarang
            </Link>

            <Link
              href="/login"
              className="
                border border-blue-600
                text-blue-600
                px-6 py-3 rounded-lg
                font-semibold
              "
            >
              Login
            </Link>

          </div>

        </div>

        {/* CARD */}

        <div
          className="
            bg-white
            rounded-2xl
            shadow-xl
            p-8
          "
        >

          <h1 className="text-2xl font-bold mb-6">

            Layanan Tersedia

          </h1>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-blue-100 p-4 rounded-lg">

              <h1 className="font-bold">
                E-KTP
              </h1>

            </div>

            <div className="bg-green-100 p-4 rounded-lg">

              <h1 className="font-bold">
                KIA
              </h1>

            </div>

            <div className="bg-yellow-100 p-4 rounded-lg">

              <h1 className="font-bold">
                IKD
              </h1>

            </div>

            <div className="bg-red-100 p-4 rounded-lg">

              <h1 className="font-bold">
                KK
              </h1>

            </div>

            <div className="bg-purple-100 p-4 rounded-lg">

              <h1 className="font-bold">
                Akta Lahir
              </h1>

            </div>

            <div className="bg-orange-100 p-4 rounded-lg">

              <h1 className="font-bold">
                Surat Pindah
              </h1>

            </div>

          </div>

        </div>

      </section>

      {/* FITUR */}

      <section className="bg-white py-16">

        <div className="max-w-6xl mx-auto px-6">

          <h1
            className="
              text-4xl font-bold
              text-center
              mb-12
            "
          >

            Keunggulan Sistem

          </h1>

          <div className="grid md:grid-cols-3 gap-6">

            {/* CARD */}

            <div className="bg-gray-100 p-6 rounded-xl">

              <h1 className="text-xl font-bold mb-3">

                Realtime

              </h1>

              <p className="text-gray-600">

                Status antrian terupdate otomatis
                tanpa refresh halaman.

              </p>

            </div>

            <div className="bg-gray-100 p-6 rounded-xl">

              <h1 className="text-xl font-bold mb-3">

                Responsive

              </h1>

              <p className="text-gray-600">

                Bisa digunakan melalui HP,
                tablet, maupun desktop.

              </p>

            </div>

            <div className="bg-gray-100 p-6 rounded-xl">

              <h1 className="text-xl font-bold mb-3">

                Online

              </h1>

              <p className="text-gray-600">

                Ambil nomor antrian dari mana saja
                tanpa datang langsung.

              </p>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer
        className="
          bg-blue-700
          text-white
          text-center
          py-5
        "
      >

        © 2026 Sistem Antrian Disdukcapil

      </footer>

    </div>
  )
}