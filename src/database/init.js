import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database
async function initializeDatabase() {
  try {
    console.log('◆ Initializing Aurelius database...');
    
    // Test connection
    const { data, error } = await supabase
      .from('agency_templates')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
    
    console.log('◆ Database connection successful!');
    console.log('◆ Found agency templates:', data.length);
    
    // Check if we need to insert default templates
    if (data.length === 0) {
      console.log('◆ Inserting default agency templates...');
      
      const defaultTemplates = [
        {
          agency_name: 'Ladies & Babes',
          imvu_caption_format: '✨ {item_name} ✨\n\nCreator: {creator_name}\nItem ID: {item_id}\nManufacturer ID: {manufacturer_id}\n\n#IMVU #Fashion #Modeling #LadiesAndBabes',
          instagram_caption_format: '✨ {item_name} ✨\n\nLoving this beautiful piece by @{creator_instagram}!\n\nItem ID: {item_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion #LadiesAndBabes #@{creator_instagram}',
          required_tags: ['#IMVU', '#Fashion', '#Modeling', '#LadiesAndBabes'],
          request_format: 'Hi! I would love to request {item_name} by {creator_name} for streaming!\n\nIMVU Link: {imvu_link}\nInstagram: @{instagram_handle}\n\nThank you for considering my request! 💕'
        },
        {
          agency_name: 'Default',
          imvu_caption_format: '✨ {item_name} ✨\n\nCreator: {creator_name}\nItem ID: {item_id}\nManufacturer ID: {manufacturer_id}\n\n#IMVU #Fashion #Modeling',
          instagram_caption_format: '✨ {item_name} ✨\n\nBeautiful piece by @{creator_instagram}!\n\nItem ID: {item_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion',
          required_tags: ['#IMVU', '#Fashion', '#Modeling'],
          request_format: 'Hi! I would love to request {item_name} by {creator_name} for streaming!\n\nIMVU Link: {imvu_link}\nInstagram: @{instagram_handle}\n\nThank you! 💕'
        }
      ];
      
      const { error: insertError } = await supabase
        .from('agency_templates')
        .insert(defaultTemplates);
      
      if (insertError) {
        console.error('Error inserting default templates:', insertError);
      } else {
        console.log('◆ Default agency templates inserted successfully!');
      }
    } else {
      console.log('◆ Agency templates already exist, skipping...');
    }
    
    console.log('◆ Database initialization complete!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('◆ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('◆ Database setup failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase, supabase };
