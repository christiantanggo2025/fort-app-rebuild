import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czsxysbtaagitczfcidi.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjk5ODU2NzIwLCJleHAiOjIxMTUyMzI3MjB9.6WsbB3cxPYxwq5V6N4zyrRYXYEFECYb7sFGQz5WzqYw';

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
