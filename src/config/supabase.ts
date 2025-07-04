import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;  // Service Role recommended for server-side
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
