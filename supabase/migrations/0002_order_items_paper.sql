-- Adds the paper finish (Metallic / Matte / Gloss) chosen for each print,
-- alongside the existing framing/frame_color columns on order_items.
alter table order_items add column if not exists paper text;
