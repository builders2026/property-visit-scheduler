import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czrepxgdsgkcimttuimh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6cmVweGdkc2drY2ltdHR1aW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDc1NDYsImV4cCI6MjA5Nzc4MzU0Nn0.P7zYAvP5Ymp2DWiN5aFAIpZEvQS3hJCsPr5tpWptdy4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
