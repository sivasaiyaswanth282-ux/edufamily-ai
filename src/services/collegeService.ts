import { supabase } from './supabase';

export interface CollegeRecord {
  id: string;
  name: string;
  city: string;
  state: string;
  official_website: string | null;
}

export interface CollegeFilters {
  search?: string;
  city?: string;
  state?: string;
}

export async function getColleges(
  filters: CollegeFilters = {},
): Promise<CollegeRecord[]> {
  let query = supabase
    .from('colleges')
    .select('id, name, city, state, official_website')
    .order('name', { ascending: true });

  if (filters.search?.trim()) {
    const search = filters.search.trim();

    query = query.ilike('name', `%${search}%`);
  }

  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  if (filters.state) {
    query = query.eq('state', filters.state);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load colleges: ${error.message}`);
  }

  return data ?? [];
}