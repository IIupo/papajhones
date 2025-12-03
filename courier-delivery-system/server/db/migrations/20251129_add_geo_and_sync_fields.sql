-- Включаем PostGIS (если разрешено в окружении)
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS delivery_lat double precision,
  ADD COLUMN IF NOT EXISTS delivery_lng double precision,
  ADD COLUMN IF NOT EXISTS shelf_since timestamp with time zone,
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS delivered_by text,
  ADD COLUMN IF NOT EXISTS delivered_lat double precision,
  ADD COLUMN IF NOT EXISTS delivered_lng double precision,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS delivered_synced_1c boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivered_synced_iiko boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_sync_attempt timestamp with time zone,
  ADD COLUMN IF NOT EXISTS sync_error text;

-- Удобный индекс для поиска по статусу/назначению
CREATE INDEX IF NOT EXISTS idx_orders_status_assigned ON orders (status, assigned_to);

-- Гео-индекс (используем выражение, если delivery_lng/lat заполнены)
-- индекс по выражению ST_SetSRID(ST_MakePoint(delivery_lng, delivery_lat), 4326)
CREATE INDEX IF NOT EXISTS idx_orders_delivery_geom ON orders USING GIST (
  (ST_SetSRID(ST_MakePoint(COALESCE(delivery_lng,0), COALESCE(delivery_lat,0)), 4326))
);