import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://puqyhmrkgmtvhowssyry.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cXlobXJrZ210dmhvd3NzeXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NDUyMzQsImV4cCI6MjA3MTIyMTIzNH0.8AOypG2-h7aABT0-GniUAwcMkLkXnKy0Ns2B4B8KVMw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
