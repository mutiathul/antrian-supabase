import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

console.log(
  "SERVICE ROLE ADA:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request){

  const { nik } = await request.json()

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("email")
    .eq("nik", nik)
    .maybeSingle()

  console.log("DATA:", data)
  console.log("ERROR:", error)

  return NextResponse.json({
    data,
    error
  })
}