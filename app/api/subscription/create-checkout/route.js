import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { tier, userId } = await request.json()
    
    // Validate input
    if (!tier || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      }
    )

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }
    
    // Create or retrieve Stripe customer
    let customerId = profile.stripe_customer_id
    
    if (!customerId) {
      // Create a new customer in Stripe
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          metadata: { user_id: userId }
        })
      })
      
      if (!customerResponse.ok) {
        const error = await customerResponse.json()
        console.error('Error creating Stripe customer:', error)
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        )
      }
      
      const customer = await customerResponse.json()
      customerId = customer.id
      
      // Update user profile with Stripe customer ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
      
      if (updateError) {
        console.error('Error updating user profile:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }
    }
    
    // Create checkout session
    const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: JSON.stringify([
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ]),
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
      })
    })
    
    if (!sessionResponse.ok) {
      const error = await sessionResponse.json()
      console.error('Error creating checkout session:', error)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }
    
    const session = await sessionResponse.json()
    
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 