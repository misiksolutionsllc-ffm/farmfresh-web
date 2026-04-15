import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, plan, interval = 'month' } = await req.json();

    const prices: Record<string, { monthly: number; yearly: number }> = {
      growth: { monthly: 30000, yearly: 288000 },
      enterprise: { monthly: 79900, yearly: 767000 },
    };

    const priceData = prices[plan];
    if (!priceData) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const amount = interval === 'year' ? priceData.yearly : priceData.monthly;

    // Create customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0] || await stripe.customers.create({
      email,
      metadata: { platform: 'EdemFarm', role: 'farmer' },
    });

    // Create PaymentIntent for subscription charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        platform: 'EdemFarm',
        type: 'subscription',
        plan,
        interval,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    });
  } catch (err: any) {
    console.error('Stripe subscription error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
