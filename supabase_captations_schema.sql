-- =============================================
-- SCHEMA PARA PÁGINA DE CAPTAÇÕES
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- Tabela principal de Captações
CREATE TABLE IF NOT EXISTS captations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  client_name TEXT,
  synopsis TEXT,
  script TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens para Composição
CREATE TABLE IF NOT EXISTS captation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captation_id UUID NOT NULL REFERENCES captations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Referências Criativas
CREATE TABLE IF NOT EXISTS captation_creative_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captation_id UUID NOT NULL REFERENCES captations(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('link', 'file')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Referências Gerais
CREATE TABLE IF NOT EXISTS captation_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captation_id UUID NOT NULL REFERENCES captations(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('link', 'file')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Takes (Checklist)
CREATE TABLE IF NOT EXISTS captation_takes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captation_id UUID NOT NULL REFERENCES captations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) - ACESSO LIVRE
-- Qualquer usuário autenticado pode fazer tudo
-- =============================================

ALTER TABLE captations ENABLE ROW LEVEL SECURITY;
ALTER TABLE captation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE captation_creative_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE captation_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE captation_takes ENABLE ROW LEVEL SECURITY;

-- Políticas para captations (acesso total)
CREATE POLICY "captations_select" ON captations FOR SELECT TO authenticated USING (true);
CREATE POLICY "captations_insert" ON captations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "captations_update" ON captations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "captations_delete" ON captations FOR DELETE TO authenticated USING (true);

-- Políticas para captation_items (acesso total)
CREATE POLICY "captation_items_select" ON captation_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "captation_items_insert" ON captation_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "captation_items_update" ON captation_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "captation_items_delete" ON captation_items FOR DELETE TO authenticated USING (true);

-- Políticas para captation_creative_references (acesso total)
CREATE POLICY "captation_creative_refs_select" ON captation_creative_references FOR SELECT TO authenticated USING (true);
CREATE POLICY "captation_creative_refs_insert" ON captation_creative_references FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "captation_creative_refs_update" ON captation_creative_references FOR UPDATE TO authenticated USING (true);
CREATE POLICY "captation_creative_refs_delete" ON captation_creative_references FOR DELETE TO authenticated USING (true);

-- Políticas para captation_references (acesso total)
CREATE POLICY "captation_refs_select" ON captation_references FOR SELECT TO authenticated USING (true);
CREATE POLICY "captation_refs_insert" ON captation_references FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "captation_refs_update" ON captation_references FOR UPDATE TO authenticated USING (true);
CREATE POLICY "captation_refs_delete" ON captation_references FOR DELETE TO authenticated USING (true);

-- Políticas para captation_takes (acesso total)
CREATE POLICY "captation_takes_select" ON captation_takes FOR SELECT TO authenticated USING (true);
CREATE POLICY "captation_takes_insert" ON captation_takes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "captation_takes_update" ON captation_takes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "captation_takes_delete" ON captation_takes FOR DELETE TO authenticated USING (true);

-- =============================================
-- TRIGGER PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_captations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_captations_updated_at ON captations;
CREATE TRIGGER trigger_update_captations_updated_at
  BEFORE UPDATE ON captations
  FOR EACH ROW
  EXECUTE FUNCTION update_captations_updated_at();
