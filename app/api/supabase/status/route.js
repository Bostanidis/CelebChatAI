import { NextResponse } from 'next/server'
import supabase from '@/utils/supabase/client'

export async function GET() {
  try {
    const { data, error } = await supabase.from('chats').select('count')
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ status: 'connected', data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 