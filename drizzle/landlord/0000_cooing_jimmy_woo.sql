CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION uuid_generate_v7() RETURNS uuid
    PARALLEL SAFE
    LANGUAGE plpgsql
AS
$$
DECLARE
  -- The current UNIX timestamp in milliseconds
  unix_time_ms CONSTANT bytea NOT NULL DEFAULT substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3);
  -- The buffer used to create the UUID, starting with the UNIX timestamp and followed by random bytes
  buffer bytea NOT NULL DEFAULT unix_time_ms || gen_random_bytes(10);
BEGIN
  -- Set most significant 4 bits of 7th byte to 7 (for UUID v7), keeping the last 4 bits unchanged
  buffer = set_byte(buffer, 6, (b'0111' || get_byte(buffer, 6)::bit(4))::bit(8)::int);
  -- Set most significant 2 bits of 9th byte to 2 (the UUID variant specified in RFC 4122), keeping the last 6 bits unchanged
  buffer = set_byte(buffer, 8, (b'10' || get_byte(buffer, 8)::bit(6))::bit(8)::int);
  RETURN encode(buffer, 'hex')::uuid;
END
$$;

-- Code: https://github.com/Betterment/postgresql-uuid-generate-v7/blob/main/README.md

ALTER FUNCTION uuid_generate_v7() OWNER TO root;

CREATE TABLE IF NOT EXISTS "tenants" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"domain" text NOT NULL,
	"db_uri" text NOT NULL,
	CONSTRAINT "tenants_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"verified" boolean DEFAULT false,
	"hash" text,
	"tfa" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"email" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_user_id_unique" UNIQUE("user_id")
);
