-- Create newsletter_subscriptions table
create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz default now(),
  status text default 'active' check (status in ('active', 'unsubscribed'))
);

-- Create email_templates table for admin-managed email content
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  subject text not null,
  header_text text,
  body_html text not null,
  footer_text text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.newsletter_subscriptions enable row level security;
alter table public.email_templates enable row level security;

-- Newsletter policies (anyone can subscribe)
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscriptions for insert
  with check (true);

create policy "Anyone can view their subscription"
  on public.newsletter_subscriptions for select
  using (true);

-- Email template policies (only admins can manage)
create policy "Anyone can view email templates"
  on public.email_templates for select
  using (true);

create policy "Only authenticated users can manage templates"
  on public.email_templates for all
  using (auth.role() = 'authenticated');

-- Create indexes
create index if not exists newsletter_email_idx on public.newsletter_subscriptions(email);
create index if not exists email_templates_name_idx on public.email_templates(name);

-- Insert default welcome email template
insert into public.email_templates (name, subject, header_text, body_html, footer_text, logo_url)
values (
  'newsletter_welcome',
  'Welcome to SynergyCon Updates! 🎉',
  'Thank You for Subscribing!',
  '<p style="font-size: 16px; line-height: 1.6; color: #333;">We''re thrilled to have you join the SynergyCon community! You''ll be the first to know about:</p><ul style="font-size: 16px; line-height: 1.8; color: #333;"><li>Speaker announcements and exclusive interviews</li><li>Early bird registration opportunities</li><li>Event schedule and session details</li><li>Behind-the-scenes updates from the creative economy</li></ul><p style="font-size: 16px; line-height: 1.6; color: #333;">SynergyCon 2.0 is happening on <strong>March 4-6, 2026</strong> at the Federal Palace Hotel, Royal Box Event Center, and Police College Ground. Mark your calendar!</p>',
  'This is a Finesser Initiative. Building Nigeria''s Creative Economy.',
  '/finesser-logo.jpg'
) on conflict (name) do nothing;
