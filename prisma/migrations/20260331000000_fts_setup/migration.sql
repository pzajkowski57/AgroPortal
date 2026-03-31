-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create Polish text search configuration with unaccent
CREATE TEXT SEARCH CONFIGURATION polish_unaccent (COPY = simple);
ALTER TEXT SEARCH CONFIGURATION polish_unaccent
  ALTER MAPPING FOR hword, hword_part, word
  WITH unaccent, simple;

-- Add searchVector column if it doesn't exist (Prisma may not create Unsupported columns)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'searchVector'
  ) THEN
    ALTER TABLE listings ADD COLUMN "searchVector" tsvector;
  END IF;
END $$;

-- Create trigger function to auto-update searchVector
CREATE OR REPLACE FUNCTION listings_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('polish_unaccent', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('polish_unaccent', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS listings_search_vector_trigger ON listings;
CREATE TRIGGER listings_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description ON listings
  FOR EACH ROW
  EXECUTE FUNCTION listings_search_vector_update();

-- Backfill existing listings
UPDATE listings SET "searchVector" =
  setweight(to_tsvector('polish_unaccent', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('polish_unaccent', COALESCE(description, '')), 'B');

-- Create GIN index for fast FTS
CREATE INDEX IF NOT EXISTS listings_search_vector_idx ON listings USING GIN ("searchVector");

-- Create trigram indexes for fuzzy matching fallback
CREATE INDEX IF NOT EXISTS listings_title_trgm_idx ON listings USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS listings_description_trgm_idx ON listings USING GIN (description gin_trgm_ops);
