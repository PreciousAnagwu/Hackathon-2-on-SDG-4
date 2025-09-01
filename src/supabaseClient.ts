import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rmydjhylmehydyeefthq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJteWRqaHlsbWVoeWR5ZWVmdGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2ODI5NzMsImV4cCI6MjA3MjI1ODk3M30.u_ycV9yTpp1tD9YZqQcYz_uOjbntNI-BaxE4UEylodc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
