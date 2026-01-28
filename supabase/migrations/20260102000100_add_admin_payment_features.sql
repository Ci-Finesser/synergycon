-- Update payments table for admin features
-- Adds refund tracking and improves payment metadata

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Add constraint to prevent invalid status transitions (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_status_refund') THEN
    ALTER TABLE payments
      ADD CONSTRAINT valid_status_refund CHECK (
        (status != 'refunded' OR refunded_at IS NOT NULL)
      );
  END IF;
END $$;

-- Create view for payment statistics by tier
CREATE OR REPLACE VIEW payment_stats_by_tier AS
SELECT
  COALESCE(meta->'tickets'->0->>'ticket_tier', 'vip') as tier,
  COUNT(*) as order_count,
  SUM((meta->'tickets'->0->>'quantity')::int) as total_tickets,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_order_value,
  COUNT(CASE WHEN status = 'successful' THEN 1 END) as successful_orders,
  ROUND(
    COUNT(CASE WHEN status = 'successful' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 
    2
  ) as success_rate
FROM payments
GROUP BY tier
ORDER BY total_revenue DESC;

-- Create view for payment statistics by duration
CREATE OR REPLACE VIEW payment_stats_by_duration AS
SELECT
  COALESCE(meta->'tickets'->0->>'ticket_duration', 'single-day') as duration,
  COUNT(*) as order_count,
  SUM((meta->'tickets'->0->>'quantity')::int) as total_tickets,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_order_value
FROM payments
WHERE status = 'successful'
GROUP BY duration
ORDER BY total_revenue DESC;

-- Create view for daily revenue summary
CREATE OR REPLACE VIEW daily_revenue_summary AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_transactions,
  COUNT(CASE WHEN status = 'successful' THEN 1 END) as successful_transactions,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
  SUM(CASE WHEN status = 'successful' THEN amount ELSE 0 END) as revenue,
  ROUND(
    COUNT(CASE WHEN status = 'successful' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100,
    2
  ) as success_rate
FROM payments
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create view for ticket type analysis
CREATE OR REPLACE VIEW ticket_type_analysis AS
SELECT
  meta->'tickets'->0->>'ticket_id' as ticket_id,
  meta->'tickets'->0->>'ticket_name' as ticket_name,
  meta->'tickets'->0->>'ticket_tier' as tier,
  meta->'tickets'->0->>'ticket_duration' as duration,
  COUNT(*) as orders,
  SUM((meta->'tickets'->0->>'quantity')::int) as total_quantity,
  SUM((meta->'tickets'->0->>'subtotal')::numeric) as total_revenue,
  AVG((meta->'tickets'->0->>'price')::numeric) as avg_price
FROM payments
WHERE status = 'successful'
GROUP BY 
  meta->'tickets'->0->>'ticket_id',
  meta->'tickets'->0->>'ticket_name',
  meta->'tickets'->0->>'ticket_tier',
  meta->'tickets'->0->>'ticket_duration'
ORDER BY total_revenue DESC;

-- Create index for meta ticket queries
CREATE INDEX IF NOT EXISTS idx_payments_meta_tickets 
  ON payments USING GIN (meta);

-- Add comments for documentation
COMMENT ON COLUMN payments.refunded_at IS 'Timestamp when payment was refunded (if applicable)';
COMMENT ON VIEW payment_stats_by_tier IS 'Aggregated payment statistics grouped by ticket tier (vip, vip-plus, vvip, priority)';
COMMENT ON VIEW payment_stats_by_duration IS 'Aggregated payment statistics grouped by pass duration (single-day, multi-day, full-event)';
COMMENT ON VIEW daily_revenue_summary IS 'Daily revenue and transaction statistics';
COMMENT ON VIEW ticket_type_analysis IS 'Detailed analysis of each ticket type sold';
