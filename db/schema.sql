create table if not exists submissions (
  id bigserial primary key,
  client_id text not null unique,
  age_range text not null check (age_range in ('<18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
  display_order jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scores (
  submission_id bigint not null references submissions(id) on delete cascade,
  design_id text not null,
  score integer not null check (score >= 0 and score <= 100),
  note text not null default '',
  primary key (submission_id, design_id)
);

create index if not exists scores_design_id_idx on scores(design_id);
create index if not exists submissions_age_range_idx on submissions(age_range);
