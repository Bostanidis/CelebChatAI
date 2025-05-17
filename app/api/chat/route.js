import { NextResponse } from 'next/server'
import supabase from '@/utils/supabase/client'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Create a Supabase client with the service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Initialize OpenAI client with DeepSeek base URL
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

export async function GET() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: sessionError.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (chatsError) {
      console.error('Chats error:', chatsError)
      return NextResponse.json({ error: chatsError.message }, { status: 500 })
    }

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Parse request body
    const { messages, character, characterId, isGuest } = await request.json();
    
    if (!messages || !character || !characterId) {
      console.error('Missing required fields:', { messages: !!messages, character: !!character, characterId: !!characterId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Skip auth check for guest users
    if (!isGuest) {
      // Get session from request
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        console.error('No authorization header');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Verify session with Supabase
      const { data: { user }, error: sessionError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (sessionError || !user) {
        console.error('Session error:', sessionError);
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }
    }

    // Create system message based on character data
    const systemMessage = character.systemPrompt || `You are ${character.name}. ${character.description || ''} 
    Your personality: ${character.personality || 'Not specified'}
    Your background: ${character.background || 'Not specified'}
    
    Respond as this character would, maintaining their unique voice, knowledge, and mannerisms.
    Keep responses concise but meaningful, showing the character's personality.`;

    // Prepare messages for the AI
    const messagesToSend = [
      { role: 'system', content: systemMessage },
      ...(character.exampleDialogue ? [{ role: 'system', content: `Example dialogue: ${character.exampleDialogue}` }] : []),
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Create stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: messagesToSend,
            temperature: 0.7,
            max_tokens: 500,
            stream: true,
          });

          let fullResponse = '';
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              // Send the chunk as a Server-Sent Event
              const data = encoder.encode(`data: ${JSON.stringify({ content })}\n\n`);
              controller.enqueue(data);
            }
          }
          
          // Send the [DONE] message
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}