-- Migration script to add new columns to current_value_by_token table
-- Run this SQL to update the existing table structure

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add symbol column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_value_by_token' AND column_name = 'symbol'
  ) THEN
    ALTER TABLE current_value_by_token ADD COLUMN symbol VARCHAR(50);
  END IF;
  
  -- Add total_invested_usd column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_value_by_token' AND column_name = 'total_invested_usd'
  ) THEN
    ALTER TABLE current_value_by_token ADD COLUMN total_invested_usd NUMERIC;
    -- Migrate data from old 'invested' column if it exists
    UPDATE current_value_by_token 
    SET total_invested_usd = invested 
    WHERE total_invested_usd IS NULL AND invested IS NOT NULL;
  END IF;
  
  -- Add token_amount_bought column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_value_by_token' AND column_name = 'token_amount_bought'
  ) THEN
    ALTER TABLE current_value_by_token ADD COLUMN token_amount_bought NUMERIC;
  END IF;
  
  -- Rename current_value if needed (it should already exist)
  -- Add unrealized_pnl column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_value_by_token' AND column_name = 'unrealized_pnl'
  ) THEN
    ALTER TABLE current_value_by_token ADD COLUMN unrealized_pnl NUMERIC;
    -- Calculate unrealized PnL from existing data
    UPDATE current_value_by_token 
    SET unrealized_pnl = current_value - COALESCE(total_invested_usd, invested, 0)
    WHERE unrealized_pnl IS NULL;
  END IF;
  
  -- Add unrealized_pnl_perc column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_value_by_token' AND column_name = 'unrealized_pnl_perc'
  ) THEN
    ALTER TABLE current_value_by_token ADD COLUMN unrealized_pnl_perc NUMERIC;
    -- Calculate unrealized PnL % from existing data
    UPDATE current_value_by_token 
    SET unrealized_pnl_perc = CASE 
      WHEN COALESCE(total_invested_usd, invested, 0) > 0 
      THEN ((current_value - COALESCE(total_invested_usd, invested, 0)) / COALESCE(total_invested_usd, invested, 1)) * 100
      ELSE 0
    END
    WHERE unrealized_pnl_perc IS NULL;
  END IF;
  
  -- Add first_purchase column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_value_by_token' AND column_name = 'first_purchase'
  ) THEN
    ALTER TABLE current_value_by_token ADD COLUMN first_purchase TIMESTAMP;
  END IF;
  
  -- Add last_purchase column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_value_by_token' AND column_name = 'last_purchase'
  ) THEN
    ALTER TABLE current_value_by_token ADD COLUMN last_purchase TIMESTAMP;
  END IF;
  
  -- Update symbol from token if symbol is null
  UPDATE current_value_by_token 
  SET symbol = token 
  WHERE symbol IS NULL AND token IS NOT NULL;
END $$;

