const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  logger.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

logger.info('Supabase client initialized.');

module.exports = supabase;
