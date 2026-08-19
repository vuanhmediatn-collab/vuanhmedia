const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from available env files (.env, .env.preview, .env.production, .env.local)
const envFiles = ['.env', '.env.local', '.env.preview', '.env.production'];
for (const envFile of envFiles) {
  const envPath = path.resolve(__dirname, '..', envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

async function sendFounderPasswordRecovery() {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rjylcqtiicmhhhpuxuyw.supabase.co';
  const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const TARGET_EMAIL = 'vuanhmediatn@gmail.com';
  const REDIRECT_URL = 'https://prosthetics-hero-9c87l6ihf-vuanhmedia.vercel.app/admin/reset-password';

  console.log(`[AUTH-RECOVERY] Target Email: ${TARGET_EMAIL}`);
  console.log(`[AUTH-RECOVERY] Supabase URL Variable: VITE_SUPABASE_URL (${SUPABASE_URL ? 'PRESENT' : 'MISSING'})`);
  console.log(`[AUTH-RECOVERY] Publishable Key Variable: VITE_SUPABASE_PUBLISHABLE_KEY (${SUPABASE_KEY ? 'PRESENT' : 'MISSING'})`);
  console.log(`[AUTH-RECOVERY] Exact redirectTo: ${REDIRECT_URL}`);
  console.log(`[AUTH-RECOVERY] Service Role Used: NO (Client Auth API Only)`);

  if (!SUPABASE_KEY) {
    console.error('❌ VITE_SUPABASE_PUBLISHABLE_KEY is not defined in local environment.');
    console.log('NOTE: The recovery email can be triggered securely directly via the Preview Web UI at:');
    console.log('https://prosthetics-hero-9c87l6ihf-vuanhmedia.vercel.app/admin/forgot-password');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(TARGET_EMAIL, {
      redirectTo: REDIRECT_URL,
    });

    if (error) {
      console.error(`❌ SDK Error: ${error.message} (Status: ${error.status || 'unknown'})`);
      process.exit(1);
    }

    console.log('✅ resetPasswordForEmail SDK Call: SUCCESS (Status: 200 OK)');
  } catch (err) {
    console.error('❌ Unexpected SDK Error:', err?.message || err);
    process.exit(1);
  }
}

sendFounderPasswordRecovery();
