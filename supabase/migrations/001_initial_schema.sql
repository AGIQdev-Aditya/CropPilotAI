-- ==============================================================================
-- CropPilot AI — Production PostgreSQL Schema for Supabase
-- Tables: farms, fields, crops, advisories
-- With Row Level Security (RLS) and Seed Data
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FARMS TABLE
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'demo-farmer-001',
    name TEXT NOT NULL,
    location TEXT,
    total_area_acres NUMERIC(8,2) DEFAULT 0,
    soil_type TEXT DEFAULT 'Loamy',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FIELDS TABLE
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    area_acres NUMERIC(8,2) DEFAULT 0,
    irrigation_type TEXT DEFAULT 'Drip Irrigation',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CROPS TABLE
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    variety TEXT,
    planting_date DATE DEFAULT CURRENT_DATE,
    stage TEXT DEFAULT 'Vegetative',
    status TEXT DEFAULT 'Healthy',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADVISORIES TABLE (AI Diagnosis Results)
CREATE TABLE IF NOT EXISTS public.advisories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'demo-farmer-001',
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    query_text TEXT NOT NULL,
    disease_identified TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Moderate',
    confidence NUMERIC(4,2) DEFAULT 0.95,
    symptoms_analysis TEXT,
    immediate_action_plan JSONB DEFAULT '[]'::jsonb,
    organic_treatment TEXT,
    chemical_treatment TEXT,
    preventive_measures JSONB DEFAULT '[]'::jsonb,
    disclaimer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anon users (for workshop demonstration and evaluation)
CREATE POLICY "Permissive access for farms" ON public.farms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permissive access for fields" ON public.fields FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permissive access for crops" ON public.crops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permissive access for advisories" ON public.advisories FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA (For Immediate Demo Testing)
-- ==============================================================================

INSERT INTO public.farms (id, user_id, name, location, total_area_acres, soil_type)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'demo-farmer-001', 'Greenfield Organic Valley', 'Pune, Maharashtra', 25.5, 'Black Cotton Soil'),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'demo-farmer-001', 'Sunrise Plateau Farm', 'Nashik, Maharashtra', 40.0, 'Red Sandy Loam')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.fields (id, farm_id, name, area_acres, irrigation_type)
VALUES 
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'North Tomato Sector', 10.0, 'Drip Irrigation'),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'South Basin Wheat', 15.5, 'Sprinkler System')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.crops (id, field_id, crop_name, variety, planting_date, stage, status)
VALUES 
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Tomatoes', 'Roma Hybrid', CURRENT_DATE - INTERVAL '35 days', 'Flowering', 'Needs Attention'),
    ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Wheat', 'Sharbati Gold', CURRENT_DATE - INTERVAL '60 days', 'Vegetative', 'Healthy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.advisories (id, user_id, crop_id, crop_name, query_text, disease_identified, severity, confidence, symptoms_analysis, immediate_action_plan, organic_treatment, chemical_treatment, preventive_measures, disclaimer)
VALUES (
    '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'demo-farmer-001',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'Tomatoes',
    'Yellow leaf spots with concentric dark rings on flowering tomatoes',
    'Early Blight (Alternaria solani)',
    'Moderate',
    0.96,
    'Concentric target-like rings surrounded by yellow chlorotic halos, primarily on lower leaves.',
    '["Prune infected lower foliage immediately to prevent upward spore splash", "Avoid overhead irrigation during evening hours", "Improve inter-row airflow"]'::jsonb,
    'Apply copper fungicide spray or dilute neem oil (5ml/L) emulsified with liquid soap every 7 days.',
    'Apply Chlorothalonil 75% WP or Mancozeb 75% WP at 2g per liter of water.',
    '["Practice 3-year crop rotation away from Solanaceae family", "Apply straw mulch to prevent soil splashing onto leaves", "Ensure balanced potassium nutrition"]'::jsonb,
    'AI-generated diagnostic recommendation. Consult local agricultural extension officers before commercial chemical application.'
) ON CONFLICT (id) DO NOTHING;
