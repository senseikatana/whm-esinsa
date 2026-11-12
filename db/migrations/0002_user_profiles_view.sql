-- Better Auth owns the user/session/account/verification tables.
-- This migration adds domain guards and the legacy `user_profiles` view the
-- GraphQL layer and staff screens still read.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_role_valid') THEN
    ALTER TABLE "user" ADD CONSTRAINT user_role_valid
      CHECK (role IN ('admin', 'manager', 'supervisor', 'operator', 'picker', 'viewer'));
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email_unique ON "user" (lower(email));
CREATE INDEX IF NOT EXISTS idx_user_role ON "user" (role);

CREATE OR REPLACE VIEW public.user_profiles AS
SELECT
  id,
  email,
  name,
  role,
  zone,
  phone,
  "isActive" AS is_active,
  NULL::TIMESTAMPTZ AS last_login,
  "createdAt" AS created_at,
  "updatedAt" AS updated_at
FROM public."user";
