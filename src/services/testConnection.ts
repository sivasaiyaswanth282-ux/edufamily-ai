import { supabase } from './supabase';

export async function testConnection() {
  const { data, error } = await supabase
    .from('colleges')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Supabase connection failed:', error.message);
    return false;
  }

  console.log('Supabase connected successfully!');
  console.log('Database query successful:', data);

  return true;
}