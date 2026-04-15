import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata = {} } = await req.json();

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Minimum amount is $0.50' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { platform: 'EdemFarm', ...metadata },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
