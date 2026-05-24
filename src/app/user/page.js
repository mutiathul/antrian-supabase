'use client'

import { supabase } from '../../../lib/supabaseClient'

export default function UserPage(){

  async function ambilAntrian(){

    const { data: lastQueue } = await supabase
      .from('antrian')
      .select('*')
      .order('nomor', { ascending:false })
      .limit(1)

    let nomorBaru = 1

    if(lastQueue.length > 0){
      nomorBaru = lastQueue[0].nomor + 1
    }

    await supabase
      .from('antrian')
      .insert([
        {
          nomor: nomorBaru,
          layanan:'Perekaman'
        }
      ])

    alert(
      'Nomor Antrian Kamu: ' + nomorBaru
    )

  }

  return (

    <div className="container mt-5">

      <h1>Ambil Antrian</h1>

      <button
        className="btn btn-success"
        onClick={ambilAntrian}
      >
        Ambil Nomor
      </button>

    </div>

  )
}