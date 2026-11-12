# Billing assistant

Answers refund and invoice questions over HTTP. Postgres holds invoices. Stripe moves money.

## Run
- `npm run lint`   layering check. Fix every ERROR before you finish.
- `npm test`       unit tests.

## Where things are
- `src/types/`     shapes only, no logic
- `src/repo/`      database reads and writes
- `src/service/`   business rules; the pro-rata maths lives here
- `src/http/`      routes and sessions

## Read before you change
- Layering, and what to do when it gets in your way: `docs/architecture.md`
- Refund rules with worked numbers: `docs/refunds.md`

## Always
- Money moves only through `src/service/refunds.ts`.
- A task is done when lint and tests print no ERROR.
