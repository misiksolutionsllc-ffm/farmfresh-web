import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, apiKey } = await req.json();

    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 401 });
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = mediaType || 'image/jpeg';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: `You are a product analyzer for a farm-to-table natural food marketplace called EdemFarm.

Analyze this photo and determine:
1. What food/farm product is shown (if any)
2. If this is NOT a food/farm product, say so clearly

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "isFood": true/false,
  "name": "Product name (e.g., 'Organic Roma Tomatoes')",
  "description": "2-3 sentence marketing description emphasizing natural/organic qualities",
  "category": "one of: Fruits, Vegetables, Dairy, Bakery, Meat, Honey, Herbs, Preserves, Beverages",
  "suggestedUnit": "one of: lb, oz, each, doz, bunch, pint, qt, gal, bushel, flat",
  "suggestedPrice": "suggested retail price as number (e.g., 3.99)",
  "confidence": "high/medium/low",
  "rejection": "if isFood is false, explain why this product cannot be listed"
}

If the image shows something that is clearly NOT a food/agricultural product (electronics, toys, clothing, etc.), set isFood to false and provide a rejection reason. We only accept natural food products.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json(
        { error: `AI analysis failed (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse JSON from response
    try {
      const cleaned = text.replace(/```json\s*|```\s*/g, '').trim();
      const result = JSON.parse(cleaned);
      return NextResponse.json(result);
    } catch (parseErr) {
      // If parsing fails, return raw text
      return NextResponse.json({
        isFood: false,
        name: '',
        description: text,
        category: 'Vegetables',
        suggestedUnit: 'lb',
        suggestedPrice: '0',
        confidence: 'low',
        rejection: 'Could not analyze image. Please try again with a clearer photo of a food product.',
      });
    }
  } catch (error: any) {
    console.error('Analyze product error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
