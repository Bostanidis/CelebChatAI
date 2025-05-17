// Test script to verify DeepSeek API connection
require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testDeepSeek() {
    console.log('Starting DeepSeek test...');
    
    try {
        // Check for API key
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error('DEEPSEEK_API_KEY not found in environment variables');
            process.exit(1);
        }
        console.log('API key found:', apiKey ? 'Yes' : 'No');

        // Initialize OpenAI client with DeepSeek base URL
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com/v1',
            apiKey: apiKey,
        });
        console.log('OpenAI client initialized with DeepSeek base URL');

        // Test chat completion
        console.log('Testing chat completion...');
        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say hello!' },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        console.log('Response:', completion.choices[0]?.message?.content);
        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Error in test:', error);
        process.exit(1);
    }
}

testDeepSeek().catch(console.error); 