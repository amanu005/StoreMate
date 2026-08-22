import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = 'ta-IN' } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;

    if (!sarvamApiKey || sarvamApiKey.includes('your-sarvam')) {
      // In demo mode without API key, return null audioBase64 to trigger client SpeechSynthesis
      return NextResponse.json({
        audioBase64: null,
        fallbackToBrowser: true,
      });
    }

    // Call Sarvam AI Bulbul TTS API
    const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': sarvamApiKey,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: language,
        speaker: 'meera', // Natural Tamil voice
        pitch: 0,
        pace: 1.0,
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v1',
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error('Sarvam TTS error:', errText);
      return NextResponse.json({ audioBase64: null, fallbackToBrowser: true });
    }

    const data = await sarvamRes.json();
    const audioBase64 = data.audios && data.audios[0] ? data.audios[0] : null;

    return NextResponse.json({
      audioBase64,
      fallbackToBrowser: !audioBase64,
    });
  } catch (error: any) {
    console.error('TTS Route error:', error);
    return NextResponse.json({ audioBase64: null, fallbackToBrowser: true });
  }
}
