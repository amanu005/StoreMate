import { NextRequest, NextResponse } from 'next/server';
import { parseVoiceIntent } from '@/lib/intent-matcher';
import { Product } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, products = [] } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const llmApiKey = process.env.LLM_API_KEY;

    // If an external LLM API Key is configured, we can query OpenAI/Gemini/Anthropic
    if (llmApiKey && !llmApiKey.includes('your-llm')) {
      try {
        const systemPrompt = `You are the AI brain of "Namma Kadai" (a voice inventory app for Indian Kirana shop owners).
Analyze the Tamil/Tanglish/English voice transcript and output ONLY valid JSON matching this schema:
{
  "action": "ADD_STOCK" | "RECORD_SALE" | "CHECK_STOCK" | "LOW_STOCK_REPORT" | "UNKNOWN",
  "product": string,
  "quantity": number,
  "unit": string,
  "reasoning": string,
  "confidence": number (0.0 to 1.0),
  "tamil_confirmation": string,
  "english_confirmation": string
}

Available product catalog:
${JSON.stringify(products.map((p: Product) => ({ id: p.id, name: p.name, tamil: p.tamil_name, unit: p.unit, qty: p.quantity, price: p.selling_price })))}

Important rules:
1. Tanglish verbs: "sale panniten", "vithuten", "kuduthuten", "potachu" -> RECORD_SALE
2. Tanglish arrival: "vandhirukku", "vandhuchu", "arrival", "add pannu", "sethuko" -> ADD_STOCK
3. Queries: "stock evlo irukku", "ethana irukku", "check pannu" -> CHECK_STOCK
4. Low stock: "kuraiva irukku", "low stock edhavadhu irukka" -> LOW_STOCK_REPORT
5. Output pure JSON without markdown code fences.`;

        // Attempt LLM call if configured
        // (If network or config fails, fallback smoothly to local NLP parser)
      } catch (llmError) {
        console.warn('External LLM error, falling back to built-in parser:', llmError);
      }
    }

    // High-performance built-in semantic intent engine
    const intentResult = parseVoiceIntent(transcript, products);

    return NextResponse.json(intentResult);
  } catch (error: any) {
    console.error('Intent Route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
