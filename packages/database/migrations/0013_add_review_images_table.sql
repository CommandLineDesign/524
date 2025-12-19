-- Create review_images table for storing individual review photo metadata
CREATE TABLE IF NOT EXISTS review_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  s3_key text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  public_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient lookup of images by review
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);

-- Create index for ordering images within a review
CREATE INDEX IF NOT EXISTS idx_review_images_display_order ON review_images(review_id, display_order);
