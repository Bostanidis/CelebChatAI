import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixMessageCountsTable() {
  try {
    console.log('Fixing message_counts table...')
    
    // First, check if the table exists
    const { error: checkError } = await supabase
      .from('message_counts')
      .select('count')
      .limit(1)
    
    if (checkError) {
      if (checkError.code === '42P01') {
        console.log('message_counts table does not exist, creating it...')
        
        // Create the table using RPC
        const { error: createError } = await supabase.rpc('create_message_counts_table')
        
        if (createError) {
          console.error('Error creating message_counts table:', createError)
          process.exit(1)
        }
        
        console.log('message_counts table created successfully!')
      } else {
        console.error('Error checking message_counts table:', checkError)
        process.exit(1)
      }
    } else {
      console.log('message_counts table exists, checking structure...')
      
      // Try to add a unique constraint on user_id
      try {
        // First, check if there are any duplicate user_ids
        const { data: duplicates, error: duplicateError } = await supabase
          .from('message_counts')
          .select('user_id, count(*)')
          .group('user_id')
          .having('count(*) > 1')
        
        if (duplicateError) {
          console.error('Error checking for duplicates:', duplicateError)
        } else if (duplicates && duplicates.length > 0) {
          console.log(`Found ${duplicates.length} users with duplicate records. Fixing...`)
          
          // For each duplicate, keep only the record with the highest count
          for (const dup of duplicates) {
            const { data: records, error: recordsError } = await supabase
              .from('message_counts')
              .select('id, count')
              .eq('user_id', dup.user_id)
              .order('count', { ascending: false })
            
            if (recordsError) {
              console.error(`Error getting records for user ${dup.user_id}:`, recordsError)
              continue
            }
            
            if (records && records.length > 1) {
              // Keep the first record (highest count), delete the rest
              const keepId = records[0].id
              const deleteIds = records.slice(1).map(r => r.id)
              
              const { error: deleteError } = await supabase
                .from('message_counts')
                .delete()
                .in('id', deleteIds)
              
              if (deleteError) {
                console.error(`Error deleting duplicate records for user ${dup.user_id}:`, deleteError)
              } else {
                console.log(`Fixed duplicates for user ${dup.user_id}`)
              }
            }
          }
        }
        
        // Now try to add the unique constraint
        console.log('Adding unique constraint on user_id...')
        
        // We can't directly add a constraint through the Supabase client,
        // so we'll use a workaround by creating a new table with the constraint
        // and copying the data
        
        // 1. Create a temporary table with the desired structure
        const { error: tempError } = await supabase.rpc('create_temp_message_counts')
        
        if (tempError) {
          console.error('Error creating temporary table:', tempError)
          process.exit(1)
        }
        
        // 2. Copy data from the old table to the new one
        const { error: copyError } = await supabase.rpc('copy_message_counts_data')
        
        if (copyError) {
          console.error('Error copying data:', copyError)
          process.exit(1)
        }
        
        // 3. Drop the old table and rename the new one
        const { error: renameError } = await supabase.rpc('finalize_message_counts_migration')
        
        if (renameError) {
          console.error('Error finalizing migration:', renameError)
          process.exit(1)
        }
        
        console.log('Successfully added unique constraint to message_counts table!')
      } catch (err) {
        console.error('Error fixing message_counts table:', err)
        process.exit(1)
      }
    }
    
    console.log('message_counts table fixed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

fixMessageCountsTable() 