import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://ithiavnxwjkdgecuhnjf.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aGlhdm54d2prZGdlY3VobmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODAwNjUsImV4cCI6MjA5NTU1NjA2NX0.lUQdvqMWdLl8YwcPFYHFH3sqHcm4HreXr0PRtC1hqGA";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);