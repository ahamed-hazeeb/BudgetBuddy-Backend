-- Migration: Add ML Phase 2-4 Tables
-- Description: Creates tables for advanced ML features including benchmarking,
-- recommendations, and financial health tracking
-- Date: 2025-12-09

BEGIN;

-- Financial Health History table
-- Stores historical health scores and grades for trend analysis
CREATE TABLE IF NOT EXISTS public.financial_health_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    grade VARCHAR(2) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    recommendations JSONB,
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- User Benchmarks table
-- Stores peer comparison data for different demographics
CREATE TABLE IF NOT EXISTS public.user_benchmarks (
    id SERIAL PRIMARY KEY,
    age_group VARCHAR(20),
    income_bracket VARCHAR(20),
    avg_savings_rate NUMERIC,
    avg_expense_ratio NUMERIC,
    top_categories JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget Recommendations table
-- Stores AI-generated budget recommendations and their status
CREATE TABLE IF NOT EXISTS public.budget_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    current_amount NUMERIC,
    recommended_amount NUMERIC,
    savings_potential NUMERIC,
    priority VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    applied_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS ix_financial_health_history_user_id ON financial_health_history(user_id);
CREATE INDEX IF NOT EXISTS ix_financial_health_history_calculated_at ON financial_health_history(calculated_at);
CREATE INDEX IF NOT EXISTS ix_budget_recommendations_user_id ON budget_recommendations(user_id);
CREATE INDEX IF NOT EXISTS ix_budget_recommendations_status ON budget_recommendations(status);
CREATE INDEX IF NOT EXISTS ix_user_benchmarks_age_income ON user_benchmarks(age_group, income_bracket);

-- Add comments for documentation
COMMENT ON TABLE financial_health_history IS 'Stores historical financial health scores with AI-generated recommendations';
COMMENT ON TABLE user_benchmarks IS 'Stores peer comparison data for benchmarking users against similar demographics';
COMMENT ON TABLE budget_recommendations IS 'Stores AI-generated budget recommendations and their application status';

COMMIT;
