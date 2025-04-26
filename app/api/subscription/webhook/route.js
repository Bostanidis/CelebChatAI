import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    // In a real implementation, you would:
    // 1. Verify the webhook signature from Stripe
    // 2. Process different event types (payment_intent.succeeded, customer.subscription.updated, etc.)
    
    const body = await request.json()
    const eventType = body.type
    
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

    // Process the webhook event
    if (eventType === 'checkout.session.completed') {
      const session = body.data.object
      const customerId = session.customer
      const subscriptionId = session.subscription
      
      // Update the user's subscription status in the database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'pro',
          subscription_id: subscriptionId,
          stripe_customer_id: customerId
        })
        .eq('stripe_customer_id', customerId)
      
      if (error) {
        console.error('Error updating subscription:', error)
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
} 