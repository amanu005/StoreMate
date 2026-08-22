import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const languageCode = (formData.get('language_code') as string) || 'ta-IN';

    const sarvamApiKey = process.env.SARVAM_API_KEY;

    if (!sarvamApiKey || sarvamApiKey.includes('your-sarvam')) {
      // Graceful fallback for demo when external API key is not yet set
      return NextResponse.json({
        transcript: '5 Coke sale panniten',
        language_code: languageCode,
        is_demo_fallback: true,
      });
    }

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Call Sarvam AI Saaras STT API
    const sarvamFormData = new FormData();
    sarvamFormData.append('file', audioFile);
    sarvamFormData.append('model', 'saaras:v1');
    sarvamFormData.append('language_code', languageCode);

    const sarvamRes = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': sarvamApiKey,
      },
      body: sarvamFormData,
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error('Sarvam STT error:', errText);
      return NextResponse.json({ error: 'Sarvam STT failed', details: errText }, { status: 500 });
    }

    const data = await sarvamRes.json();
    return NextResponse.json({
      transcript: data.transcript || '',
      language_code: languageCode,
    });
  } catch (error: any) {
    console.error('STT Route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
