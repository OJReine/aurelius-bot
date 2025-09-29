// Database Connection Test Script
// Run this to verify Supabase connection

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('◆ Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('agency_templates')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Found agency templates:', data.length);
    
    // Test insert
    const { data: insertData, error: insertError } = await supabase
      .from('streams')
      .insert({
        user_id: 'test-user',
        item_name: 'Test Item',
        creator_name: 'Test Creator',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return;
    }
    
    console.log('✅ Insert test successful!');
    console.log('📝 Created test stream:', insertData[0].id);
    
    // Clean up test data
    await supabase
      .from('streams')
      .delete()
      .eq('id', insertData[0].id);
    
    console.log('🧹 Cleaned up test data');
    console.log('❧ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();
