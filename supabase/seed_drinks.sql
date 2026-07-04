-- ============================================================
-- GSCHPUSI SHOTRACE – Seed: Getränke für den Drink Check-in
-- Die 13 Einzelgetränke (KEINE Kartons) aus dem Übergabeprotokoll (Abschnitt 5).
-- "Shot Marille" bewusst NICHT geseedet – hat noch keinen Freisteller,
-- kommt später über die Admin-Getränkeverwaltung.
--
-- Ausführen im Supabase SQL-Editor NACH schema.sql.
-- Idempotent: setzt image_url/sort für vorhandene Getränke (per Name) neu
-- und legt fehlende an. Mehrfaches Ausführen erzeugt keine Duplikate.
-- ============================================================

with seed(name, image_url, sort) as (
  values
    ('Shot Kirsch',          'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi_Kirsch.png?v=1730822124', 1),
    ('Shot Ice',             'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi_Ice.png?v=1730822064', 2),
    ('Shot Feige',           'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi_Feige.png?v=1730820854', 3),
    ('Shot Kräuter',         'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi_Kraeuter_0.png?v=1730822213', 4),
    ('Shot Sauer',           'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi_Sauer.png?v=1731409662', 5),
    ('Shot Sahne',           'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi-Sahne_Flasche.png?v=1781450147', 6),
    ('Shot Willi',           'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/WilliFlasche.png?v=1730824361', 7),
    ('Espresso Martini',     'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Gschpusi_Espresso.png?v=1781450148', 8),
    ('Skiwasser mit Schuss', 'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Dose_SKIWASSER.png?v=1781449601', 9),
    ('Holunder mit Schuss',  'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Dose_HOLUNDER.png?v=1781449601', 10),
    ('Lemon Ice mit Schuss', 'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Dose_LEMON_afce43ad-63fc-4f4f-9006-c6f5ce84253c.png?v=1781449602', 11),
    ('Gspritzter',           'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Dose_GSPRITZER_kl.png?v=1781449601', 12),
    ('Somma Sprizza',        'https://cdn.shopify.com/s/files/1/0857/9786/3752/files/Dose_SOMMA-SPRIZZA_kl.png?v=1781449601', 13)
),
updated as (
  update public.drinks d
     set image_url = s.image_url, sort = s.sort, active = true
    from seed s
   where d.name = s.name
  returning d.name
)
insert into public.drinks (name, image_url, sort, active)
select s.name, s.image_url, s.sort, true
  from seed s
 where s.name not in (select name from updated);
