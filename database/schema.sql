-- Database schema for storing Dune query results
-- Run this SQL to create the tables

-- Table for token metrics
CREATE TABLE IF NOT EXISTS token_metrics (
  id SERIAL PRIMARY KEY,
  total_pump_purchases_sol NUMERIC,
  total_pump_purchases_usd NUMERIC,
  total_supply NUMERIC,
  total_circulating_supply_offset NUMERIC,
  token_symbol VARCHAR(10),
  gff_investment_usd NUMERIC,
  neet_current_value_usd NUMERIC,
  neet_unrealized_pnl_usd NUMERIC,
  neet_unrealized_pnl_perc NUMERIC,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(token_symbol)
);

-- Table for chart data (price and market cap over time)
CREATE TABLE IF NOT EXISTS chart_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  price NUMERIC,
  market_cap NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);

-- Table for current value by token invested chart data
CREATE TABLE IF NOT EXISTS current_value_by_token (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  symbol VARCHAR(50),
  total_invested_usd NUMERIC,
  token_amount_bought NUMERIC,
  current_value NUMERIC,
  unrealized_pnl NUMERIC,
  unrealized_pnl_perc NUMERIC,
  first_purchase TIMESTAMP,
  last_purchase TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(token)
);

-- Table for holders data
CREATE TABLE IF NOT EXISTS holders (
  id SERIAL PRIMARY KEY,
  holder_address VARCHAR(255) NOT NULL,
  balance NUMERIC,
  perc_share NUMERIC,
  first_acquisition_time TIMESTAMP,
  flow_24h NUMERIC,
  flow_7d NUMERIC,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(holder_address)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_holders_balance ON holders(balance DESC);
CREATE INDEX IF NOT EXISTS idx_chart_data_date ON chart_data(date ASC);
CREATE INDEX IF NOT EXISTS idx_holders_updated ON holders(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_current_value_by_token_updated ON current_value_by_token(updated_at DESC);

-- Migration: Add neet columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'token_metrics' AND column_name = 'neet_current_value_usd'
  ) THEN
    ALTER TABLE token_metrics ADD COLUMN neet_current_value_usd NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'token_metrics' AND column_name = 'neet_unrealized_pnl_usd'
  ) THEN
    ALTER TABLE token_metrics ADD COLUMN neet_unrealized_pnl_usd NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'token_metrics' AND column_name = 'neet_unrealized_pnl_perc'
  ) THEN
    ALTER TABLE token_metrics ADD COLUMN neet_unrealized_pnl_perc NUMERIC;
  END IF;
END $$;

