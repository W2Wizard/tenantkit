// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Lucia, generateId } from "lucia";
import { TimeSpan, createDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { dev } from "$app/environment";
import { resetTokens, sessions, verificationTokens } from "../db/schemas/landlord";
import { eq } from "drizzle-orm";
import { users } from "@/db/schemas/shared";
import type { User } from "./tenancy";

// ============================================================================

/** The length of the reset token. */
export const RESET_TOKEN_LENGTH = 40;
/** The length of the verification code. */
export const VERIFICATION_CODE_LENGTH = 8;

/**
 * Lucia Auth is like our "session driver" as it makes the requests for use
 * to handle authentication verification etc
 * @param db The database.
 * @returns A new lucia auth instance
 *
 * TODO: Any is bad here but really doesn't matter as we don't need anything from
 * it... for now.
 */
export function createLucia(db: PostgresJsDatabase<any>, domain: string) {
	return new Lucia(new DrizzlePostgreSQLAdapter(db, sessions, users), {
		sessionCookie: {
			attributes: {
				secure: !dev,
				sameSite: "strict",
				domain
			}
		}
		// getUserAttributes: (attributes) => {
		// 	return {
		// 		requires2fa: attributes.tfa !== null
		// 	};
		// }
	});
}

export type LuciaType = ReturnType<typeof createLucia>;

// ============================================================================

/**
 * Creates a password reset token for the user.
 * Deletes any existing token for the user.
 * @param userId
 * @returns
 */
export async function createResetToken(db: PostgresJsDatabase, userId: string) {
	return await db.transaction(async (tx) => {
		const tokenId = generateId(RESET_TOKEN_LENGTH);
		const expiresAt = createDate(new TimeSpan(30, "m"));

		await tx.delete(resetTokens).where(eq(resetTokens.userId, userId));
		await tx.insert(resetTokens).values({
			id: tokenId,
			userId,
			expiresAt
		});

		return tokenId;
	});
}

/**
 * Creates a verification code for the user.
 * @param userId The user's ID.
 * @param email The user's email.
 * @returns The verification code.
 */
export async function createVerificationCode(
	db: PostgresJsDatabase,
	userId: string,
	email: string
) {
	return await db.transaction(async (tx) => {
		await tx.delete(verificationTokens).where(eq(verificationTokens.userId, userId));
		const code = generateRandomString(VERIFICATION_CODE_LENGTH, alphabet("0-9"));

		await tx.insert(verificationTokens).values({
			expiresAt: createDate(new TimeSpan(5, "m")),
			userId,
			email,
			code
		});

		return code;
	});
}

// ============================================================================

declare module "lucia" {
	interface Register {
		Lucia: LuciaType;
		DatabaseUserAttributes: User;
	}
}
