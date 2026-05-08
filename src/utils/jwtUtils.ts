/**
 * Extracts the `sub` (subject / user ID) claim from a JWT without a library.
 * Returns null if the token is missing, malformed, or lacks a sub claim.
 */
export function parseJwtUserId(
	token: string | null | undefined,
): string | null {
	if (!token) {
		return null;
	}

	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return null;
		}

		// Base64url → base64 → JSON
		let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		while (base64.length % 4 !== 0) {
			base64 += '=';
		}

		if (typeof globalThis.atob !== 'function') {
			return null;
		}

		const json = globalThis.atob(base64);
		const payload = JSON.parse(json) as Record<string, unknown>;

		return typeof payload.sub === 'string' ? payload.sub : null;
	} catch {
		return null;
	}
}
