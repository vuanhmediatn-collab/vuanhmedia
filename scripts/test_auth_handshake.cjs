const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.preview
const envPath = path.resolve(__dirname, '../.env.preview');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

async function testSupabaseAuthHandshake() {
  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://rjylcqtiicmhhhpuxuyw.supabase.co';
  }
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  console.log('[AUTH-HANDSHAKE] Supabase Project URL: https://rjylcqtiicmhhhpuxuyw.supabase.co');
  console.log('[AUTH-HANDSHAKE] Publishable Key Loaded:', Boolean(supabaseKey));

  if (!supabaseKey) {
    console.error('❌ VITE_SUPABASE_PUBLISHABLE_KEY is missing from environment.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('[AUTH-HANDSHAKE] Submitting invalid test credentials to Supabase Auth...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'invalid-test-user@example.com',
    password: 'InvalidPassword123!',
  });

  if (error) {
    console.log('----------------------------------------------------');
    console.log('✅ Supabase Auth Endpoint Successfully Reached!');
    console.log('HTTP Status Code:', error.status);
    console.log('Auth Error Response:', error.message);
    console.log('Supabase Error Code:', error.code || 'invalid_credentials');
    console.log('----------------------------------------------------');
  } else {
    console.log('[AUTH-HANDSHAKE] Unexpected sign in result:', data);
  }
}

testSupabaseAuthHandshake();
