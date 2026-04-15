import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { amount, email, role, method = 'standard' } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Minimum payout is $1.00' }, { status: 400 });
    }

    // Find or create customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0] || await stripe.customers.create({
      email,
      metadata: { platform: 'EdemFarm', role },
    });

    // Create a PaymentIntent to track the payout request
    // In production, this would use Stripe Connect with Transfer API
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // cents
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        platform: 'EdemFarm',
        type: 'payout_request',
        role,
        method, // 'instant' or 'standard'
        payout_amount: (amount / 100).toFixed(2),
      },
    });

    return NextResponse.json({
      success: true,
      payoutId: paymentIntent.id,
      amount: amount / 100,
      method,
      estimatedArrival: method === 'instant' ? '30 minutes' : '1-3 business days',
    });
  } catch (err: any) {
    console.error('Payout error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
