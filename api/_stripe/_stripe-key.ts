export function getStripeSecretKey(): string {
  const envCandidates = [
    process.env.STRIPE_SECRET_KEY,
    process.env.STRIPE_SECRET,
    process.env.STRIPE_API_KEY,
    process.env.STRIPE_KEY,
  ];

  for (const candidate of envCandidates) {
    if (candidate && typeof candidate === 'string') {
      const match = candidate.match(/sk_(?:live|test)_[0-9a-zA-Z]+/);
      if (match && match[0].length > 30) {
        return match[0];
      }
    }
  }

  return '';
}

export function getStripePublishableKey(): string {
  const envCandidates = [
    process.env.STRIPE_PUBLISHABLE_KEY,
    process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    process.env.STRIPE_PUBLIC_KEY,
  ];

  for (const candidate of envCandidates) {
    if (candidate && typeof candidate === 'string') {
      const match = candidate.match(/pk_(?:live|test)_[0-9a-zA-Z]+/);
      if (match && match[0].length > 30) {
        return match[0];
      }
    }
  }

  return '';
}
