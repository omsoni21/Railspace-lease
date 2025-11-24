import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl =
    process.env.OPENAI_API_BASE || // Use custom base (like OpenRouter)
    'https://api.openai.com/v1'; // Default: OpenAI

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key. Please set OPENAI_API_KEY in your .env.local file.' },
      { status: 500 }
    );
  }

  try {
    // 🔍 Log for debugging (optional)
    console.log('🔍 Using base URL:', baseUrl);
    console.log('🔍 Using API key prefix:', apiKey.slice(0, 10) + '...');

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for RailSpace.' },
          { role: 'user', content: message },
        ],
        max_tokens: 256,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ OpenAI API error:', data);
      return NextResponse.json({ error: data.error?.message || 'OpenAI API error', details: data }, { status: 500 });
    }

    const answer = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('❌ Server Error:', err);
    return NextResponse.json({ error: 'Server failed to connect to AI API.' }, { status: 500 });
  }
}
