// Supabase Configuration
// DO NOT commit this file with real credentials to public repositories
const SUPABASE_CONFIG = {
    url: 'https://rwpapbwtcmgdptiwmicr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cGFwYnd0Y21nZHB0aXdtaWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTQ3MDcsImV4cCI6MjA4ODQ3MDcwN30.wP6ZEa_7xmj-S31ZAHZidWsz1yXZpBUUqBk09y53xb8',
    bucketName: 'mediterra-images'
};

// Initialize Supabase client (will be available after including the library)
let supabaseClient = null;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase client initialized');
        return supabaseClient;
    } else {
        console.error('❌ Supabase library not loaded');
        return null;
    }
}
