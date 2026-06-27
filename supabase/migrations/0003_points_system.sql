-- Migration file for Points/Internal Credit System

CREATE TYPE "public"."points_transaction_type" AS ENUM('grant', 'spend', 'adjust', 'refund');

CREATE TABLE "points_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone,
	"updated_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	CONSTRAINT "points_accounts_profile_id_unique" UNIQUE("profile_id")
);

CREATE TABLE "points_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" "points_transaction_type" NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "rooms" ADD COLUMN "point_cost" integer DEFAULT 0 NOT NULL;
ALTER TABLE "pass_tiers" ADD COLUMN "point_cost" integer DEFAULT 0 NOT NULL;

ALTER TABLE "points_accounts" ADD CONSTRAINT "points_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "points_accounts" ADD CONSTRAINT "points_accounts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;

-- Enable Row-Level Security
ALTER TABLE "points_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "points_accounts" FORCE ROW LEVEL SECURITY;
CREATE POLICY points_accounts_isolation ON points_accounts USING (tenant_id = auth.tenant_id());

ALTER TABLE "points_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "points_transactions" FORCE ROW LEVEL SECURITY;
CREATE POLICY points_transactions_isolation ON points_transactions USING (tenant_id = auth.tenant_id());

-- Trigger function for auto-provisioning default welcome points (1,000 points)
CREATE OR REPLACE FUNCTION public.handle_new_profile_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.points_accounts (tenant_id, profile_id, balance, created_at, updated_at)
  VALUES (NEW.tenant_id, NEW.id, 1000, now(), now())
  ON CONFLICT (profile_id) DO NOTHING;
  
  INSERT INTO public.points_transactions (tenant_id, profile_id, amount, type, description, created_at)
  VALUES (NEW.tenant_id, NEW.id, 1000, 'grant', 'Saldo awal selamat datang (1.000 Poin)', now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created_points
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_points();

-- Backfill points for existing seeded profiles
INSERT INTO public.points_accounts (tenant_id, profile_id, balance, created_at, updated_at)
SELECT tenant_id, id, 1000, now(), now()
FROM public.profiles
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.points_transactions (tenant_id, profile_id, amount, type, description, created_at)
SELECT tenant_id, id, 1000, 'grant', 'Saldo awal selamat datang (1.000 Poin)', now()
FROM public.profiles
ON CONFLICT DO NOTHING;
