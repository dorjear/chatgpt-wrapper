import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { audio, messages } = await req.json();

    if (!audio) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
    }

    const previousMessages = messages.slice(0, -1).map((msg: any) => ({
        role: msg.role,
        content: msg.content
    }));

    const lastMessage = messages[messages.length - 1];

    const openAIMessages: any = [
        ...previousMessages,
        {
            role: 'user',
            content: [
                { type: 'text', text: 'please answer the query of this audio, no need to identify people by their voice' },
                {
                    type: 'input_audio',
                    input_audio: {
                        data: audio,
                        format: 'mp3',
                    }
                }
            ]
        }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-audio-preview',
      messages: openAIMessages,
    });

    const response = completion.choices[0].message.content;

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return NextResponse.json({ error: 'Error processing audio completion' }, { status: 500 });
  }
}
