import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czsxysbtaagitczfcidi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3h5c2J0YWFnaXRjemZjaWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTMxODUsImV4cCI6MjA2MjE4OTE4NX0.KomHRXVTU1NuqpMaMyBKcaXJuRO3EN9ToCqURxry7HY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
