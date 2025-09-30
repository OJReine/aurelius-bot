import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export const dbHelpers = {
  // Stream helpers
  async createStream(data) {
    const { data: result, error } = await supabase
      .from('streams')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },
  
  async getActiveStreams(userId, serverId = null) {
    let query = supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (serverId) {
      query = query.eq('server_id', serverId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async completeStream(streamId) {
    const { data, error } = await supabase
      .from('streams')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', streamId)
      .select();
    
    if (error) throw error;
    return data;
  },
  
  async getOverdueStreams() {
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('status', 'active')
      .lte('due_date', new Date().toISOString());
    
    if (error) throw error;
    return data;
  },
  
  // Schedule helpers
  async createSchedule(data) {
    const { data: result, error } = await supabase
      .from('schedules')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },
  
  async getCurrentWeekSchedule(userId, weekStart) {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .limit(1);
    
    if (error) throw error;
    return data;
  },
  
  // Caption helpers
  async saveCaption(data) {
    const { data: result, error } = await supabase
      .from('captions')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },
  
  async getCaptionsByStream(streamId) {
    const { data, error } = await supabase
      .from('captions')
      .select('*')
      .eq('stream_id', streamId);
    
    if (error) throw error;
    return data;
  },
  
  // Review helpers
  async saveReview(data) {
    const { data: result, error } = await supabase
      .from('reviews')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },
  
  async getReviewsByStream(streamId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('stream_id', streamId);
    
    if (error) throw error;
    return data;
  },
  
  // User profile helpers
  async createOrUpdateProfile(data) {
    const { data: result, error } = await supabase
      .from('user_profiles')
      .upsert(data, { onConflict: 'user_id' })
      .select();
    
    if (error) throw error;
    return result;
  },
  
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) throw error;
    return data;
  },
  
  // Reminder helpers
  async createReminder(data) {
    const { data: result, error } = await supabase
      .from('reminders')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },
  
  async getActiveReminders() {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_active', true)
      .lte('scheduled_for', new Date().toISOString());
    
    if (error) throw error;
    return data;
  },
  
  // Agency template helpers
  async getAgencyTemplate(agencyName) {
    const { data, error } = await supabase
      .from('agency_templates')
      .select('*')
      .eq('agency_name', agencyName)
      .eq('is_active', true)
      .limit(1);
    
    if (error) throw error;
    return data;
  },
  
  async getAllAgencyTemplates() {
    const { data, error } = await supabase
      .from('agency_templates')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  }
};

export default supabase;
