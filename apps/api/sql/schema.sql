create extension if not exists "uuid-ossp";

create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  plan text not null default 'starter',
  trial_ends_at timestamptz,
  subscription_status text default 'trial',
  subscription_ends_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'staff',
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  status text default 'new',
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  amount numeric(12,2) not null,
  currency text not null default 'NGN',
  stage text not null default 'new',
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider text not null,
  reference text unique not null,
  amount numeric(12,2) not null,
  currency text not null,
  status text not null default 'pending',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  invoice_number text unique not null,
  amount numeric(12,2) not null,
  currency text not null,
  file_path text not null,
  created_at timestamptz default now()
);

create table if not exists followups (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  message text not null,
  send_at timestamptz not null,
  status text not null default 'scheduled',
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists system_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  level text not null,
  message text not null,
  created_at timestamptz default now()
);

create index if not exists idx_customers_org on customers(organization_id);
create index if not exists idx_orders_org on orders(organization_id);
create index if not exists idx_payments_org_status on payments(organization_id, status);
create index if not exists idx_followups_schedule on followups(status, send_at);
