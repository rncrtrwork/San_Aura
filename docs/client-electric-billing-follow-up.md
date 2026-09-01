# Client follow-up: electric billing confirmations

Use this message before enabling weekly electric charges in production.

Hi,

We have the electric billing workflow ready for meter readings, kWh deltas, flat daily charges, and prepaid-balance drawdown. Before we turn on weekly electric charges, can you confirm these two details?

1. What exact weekly electric rate should apply to $2,000-tier members who pay electric by the week?
2. You mentioned you might be forgetting one membership tier. Is there a fifth tier beyond $2,850, $2,000, $1,250, and $500? If yes, what is its annual amount and electric billing rule?

Current implementation notes:

- $2,850 defaults to $25/day flat electric billing.
- $2,000 defaults to weekly electric billing, but weekly charges are held at $0 until the weekly amount is confirmed.
- $1,250 defaults to $15/day flat electric billing.
- $500 defaults to $0.25/kWh billing.
- Individual members can still have an electric billing override for exceptions, including $2,000 members who pay a flat rate.
