// Supabase Configuration
// DO NOT commit this file with real credentials to public repositories
const SUPABASE_CONFIG = {
    url: 'https://tgbvjmknsjiutksucbnt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYnZqbWtuc2ppdXRrc3VjYm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Nzc5NjEsImV4cCI6MjA4MjE1Mzk2MX0.p4e4XMoWqVRBOS_-vqaSl44myRGy1HdGD5snvbBHQn4',
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
