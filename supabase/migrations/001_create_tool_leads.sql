-- Create tool_leads table for capturing leads from free tools
-- Run this migration in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS tool_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  host_name TEXT,
  company_name TEXT,
  state TEXT,
  asset_type TEXT,
  source TEXT NOT NULL,  -- 'waiver-generator', 'battery-calculator', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,  -- When they signed up as a user
  user_id UUID REFERENCES auth.users(id)  -- Link if they convert
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tool_leads_email ON tool_leads(email);
CREATE INDEX IF NOT EXISTS idx_tool_leads_source ON tool_leads(source);
CREATE INDEX IF NOT EXISTS idx_tool_leads_created ON tool_leads(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE tool_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (server-side only)
CREATE POLICY "Service role can insert tool_leads"
  ON tool_leads
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Only service role can read (for admin dashboards)
CREATE POLICY "Service role can read tool_leads"
  ON tool_leads
  FOR SELECT
  TO service_role
  USING (true);
