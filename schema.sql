create table public.data_catalog (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  table_name text not null,
  schema_name text not null default 'public',
  description text,
  owner text,
  type text check (type in ('Source', 'Bronce', 'Silver', 'Gold')),
  source_system text,
  db_name text,
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) not null,
  modified_at timestamptz,
  modified_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);
alter table public.data_catalog enable row level security;

create table public.kpi_catalog (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  category text,
  formula text,
  unit text,
  owner text,
  frequency text check (frequency in ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')),
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) not null,
  modified_at timestamptz,
  modified_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);
alter table public.kpi_catalog enable row level security;

create table public.business_glossary (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  term text not null,
  definition text,
  business_owner text,
  data_owner text,
  domain text,
  status text check (status in ('Draft', 'Approved', 'Deprecated')),
  related_terms text[] default '{}',
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) not null,
  modified_at timestamptz,
  modified_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);
alter table public.business_glossary enable row level security;

create table public.data_lineage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  source_system text,
  source_table text,
  target_system text,
  target_table text,
  transformation text,
  pipeline_name text,
  schedule text,
  owner text,
  status text check (status in ('Active', 'Deprecated')),
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) not null,
  modified_at timestamptz,
  modified_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);
alter table public.data_lineage enable row level security;

create table public.report_catalog (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  tool text,
  url text,
  description text,
  owner text,
  business_users text,
  source_tables text[] default '{}',
  status text check (status in ('Active', 'Deprecated', 'Under Review')),
  refresh_frequency text,
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) not null,
  modified_at timestamptz,
  modified_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);
alter table public.report_catalog enable row level security;

create table public.data_quality_rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  rule_type text check (rule_type in ('Completeness', 'Uniqueness', 'Validity', 'Consistency', 'Timeliness', 'Accuracy')),
  description text,
  target_table text,
  target_column text,
  condition text,
  severity text check (severity in ('Critical', 'High', 'Medium', 'Low')),
  owner text,
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) not null,
  modified_at timestamptz,
  modified_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);
alter table public.data_quality_rules enable row level security;

-- User roles (Admin / Editor / Viewer)
-- Bootstrap first admin via SQL:
--   INSERT INTO public.user_roles (user_id, role, created_by)
--   SELECT id, 'Admin', id FROM auth.users WHERE email = 'your@email.com';
create table public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('Admin', 'Editor', 'Viewer')) default 'Viewer',
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id)
);
alter table public.user_roles enable row level security;
create policy "Authenticated users can read roles" on public.user_roles
  for select using (auth.role() = 'authenticated');

