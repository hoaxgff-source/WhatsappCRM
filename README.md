# WhatsApp CRM SaaS (Production-Oriented)

A real full-stack SaaS foundation for WhatsApp/Instagram-first businesses in Africa with end-to-end backend automation.

## Stack
- **Web:** Next.js 14 + Framer Motion + glassmorphism UI
- **API:** Express + PostgreSQL + JWT + cron automation
- **Integrations:** Paystack, Flutterwave, Stripe, WhatsApp Cloud API, SMTP, OpenAI
- **Infra:** Docker Compose for Postgres/Redis

## Implemented capabilities
- Multi-tenant organizations with isolated data by `organization_id`
- JWT auth and RBAC (`admin`, `staff`)
- CRM customers + order pipeline
- Payment initialization for Paystack/Flutterwave/Stripe
- Webhook receivers with signature checks hooks
- Automated subscription activation/downgrade logic
- Invoice PDF generation and storage path persistence
- Scheduled follow-up delivery and expiry checks
- Email notifications on subscription/payment lifecycle events
- AI smart reply endpoint
- Admin analytics endpoints

## Run locally
1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Start infra:
   ```bash
   docker compose up -d
   ```
3. Install deps:
   ```bash
   npm install
   ```
4. Apply database schema:
   ```bash
   psql postgres://postgres:postgres@localhost:5432/whatsapp_crm -f apps/api/sql/schema.sql
   ```
5. Run API + web:
   ```bash
   npm run dev
   ```

## Production notes
- Use a managed PostgreSQL and Redis instance.
- Set real webhook secrets and API keys via environment variables.
- Put API behind a reverse proxy with TLS and webhook allow-listing.
- Add object storage for generated invoices and backups.
