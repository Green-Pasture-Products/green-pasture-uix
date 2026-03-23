// utils/secureStorage.ts - Encrypted localStorage for tokens
import CryptoJS from "crypto-js";

/**
 * Generate a unique encryption key per user session
 * This makes it harder for attackers even if they get the encrypted data
 */
const generateSessionKey = (): string => {
	// In a real app, you might combine:
	// - User agent
	// - Session ID from server
	// - Random value generated on first load
	const userAgent =
		typeof window !== "undefined" ? window.navigator.userAgent : "";
	// Use localStorage instead of sessionStorage
  // so key persists across page loads
	let persistentId =
		typeof window !== "undefined"
			? localStorage.getItem("_session_key")
			: null;

	if (!persistentId && typeof window !== "undefined") {
		persistentId = CryptoJS.lib.WordArray.random(16).toString();
		localStorage.setItem("_session_key", persistentId);
	}

	return `${persistentId}-${userAgent}`;
};

/**
 * Get encryption key from environment or generate one
 * IMPORTANT: Set NEXT_PUBLIC_ENCRYPTION_KEY in your .env.local file
 */
const getEncryptionKey = (): string => {
	const envKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
	const sessionKey = generateSessionKey();

	// Combine environment key with session key for better security
	return envKey ? `${envKey}-${sessionKey}` : sessionKey;
};

/**
 * Encrypt data before storing in localStorage
 */
export const encryptData = (data: any): string => {
	try {
		const jsonString = JSON.stringify(data);
		const key = getEncryptionKey();
		const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
		return encrypted;
	} catch (error) {
		console.error("Encryption error:", error);
		throw new Error("Failed to encrypt data");
	}
};

/**
 * Decrypt data retrieved from localStorage
 */
export const decryptData = (encryptedData: string): any => {
	try {
		const key = getEncryptionKey();
		const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
		const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

		if (!jsonString) {
			throw new Error("Decryption resulted in empty string");
		}

		return JSON.parse(jsonString);
	} catch (error) {
		console.error("Decryption error:", error);
		// If decryption fails, clear the corrupted data
		return null;
	}
};

/**
 * Secure storage wrapper for tokens
 */
export const secureTokenStorage = {
	/**
	 * Save tokens to encrypted localStorage
	 */
	setTokens: (accessToken: string, refreshToken: string, user?: any) => {
		try {
			const data = {
				accessToken,
				refreshToken,
				user: user || null,
				timestamp: Date.now(),
			};

			const encrypted = encryptData(data);
			localStorage.setItem("secure_auth", encrypted);

			// Also store a hash to detect tampering
			const hash = CryptoJS.SHA256(encrypted).toString();
			localStorage.setItem("secure_auth_hash", hash);
		} catch (error) {
			console.error("Error storing tokens:", error);
		}
	},

	/**
	 * Retrieve tokens from encrypted localStorage
	 */
	getTokens: (): {
		accessToken: string;
		refreshToken: string;
		user: any;
	} | null => {
		try {
			const encrypted = localStorage.getItem("secure_auth");
			const storedHash = localStorage.getItem("secure_auth_hash");

			if (!encrypted) return null;

			// Verify data hasn't been tampered with
			const currentHash = CryptoJS.SHA256(encrypted).toString();
			if (storedHash !== currentHash) {
				console.warn("Token data may have been tampered with");
				secureTokenStorage.clearTokens();
				return null;
			}

			const decrypted = decryptData(encrypted);

			if (!decrypted) {
				secureTokenStorage.clearTokens();
				return null;
			}

			// Check if tokens are too old (optional: 7 days max)
			const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
			const age = Date.now() - (decrypted.timestamp || 0);

			if (age > MAX_AGE) {
				console.warn("Tokens are too old, clearing");
				secureTokenStorage.clearTokens();
				return null;
			}

			return decrypted;
		} catch (error) {
			console.error("Error retrieving tokens:", error);
			secureTokenStorage.clearTokens();
			return null;
		}
	},

	/**
	 * Clear all stored tokens
	 */
	clearTokens: () => {
		try {
			localStorage.removeItem("secure_auth");
			localStorage.removeItem("secure_auth_hash");
		} catch (error) {
			console.error("Error clearing tokens:", error);
		}
	},

	/**
	 * Update only the access token (after refresh)
	 */
	updateAccessToken: (accessToken: string) => {
		try {
			const current = secureTokenStorage.getTokens();
			if (current) {
				secureTokenStorage.setTokens(
					accessToken,
					current.refreshToken,
					current.user
				);
			}
		} catch (error) {
			console.error("Error updating access token:", error);
		}
	},

	refreshAccessToken: async (): Promise<string | null> => {
    try {
      const current = secureTokenStorage.getTokens();
      if (!current?.refreshToken) return null;

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });

      if (!response.ok) {
        secureTokenStorage.clearTokens();
        return null;
      }

      const data = await response.json();
      const newAccessToken = data?.data?.accessToken;

      if (newAccessToken) {
        secureTokenStorage.updateAccessToken(newAccessToken);
        return newAccessToken;
      }

      return null;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  },
};

/**
 * General secure storage for any data (not just tokens)
 */
export const secureStorage = {
	setItem: (key: string, value: any) => {
		try {
			const encrypted = encryptData(value);
			localStorage.setItem(key, encrypted);
		} catch (error) {
			console.error(`Secure storage set error for ${key}:`, error);
		}
	},

	getItem: (key: string): any => {
		try {
			const encrypted = localStorage.getItem(key);
			if (!encrypted) return null;
			return decryptData(encrypted);
		} catch (error) {
			console.error(`Secure storage get error for ${key}:`, error);
			return null;
		}
	},

	removeItem: (key: string) => {
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error(`Secure storage remove error for ${key}:`, error);
		}
	},

	clear: () => {
		try {
			localStorage.clear();
			sessionStorage.clear();
		} catch (error) {
			console.error("Secure storage clear error:", error);
		}
	},
};

/**
 * IMPORTANT SECURITY NOTES:
 *
 * 1. Client-side encryption is NOT foolproof - a determined attacker with access
 *    to the JS bundle can potentially extract the encryption key
 *
 * 2. This adds a significant layer of protection against:
 *    - Casual inspection of localStorage
 *    - Simple XSS attacks that just read localStorage
 *    - Automated token harvesting scripts
 *
 * 3. For maximum security, combine this with:
 *    - Short-lived access tokens (5-15 minutes)
 *    - Token rotation on each refresh
 *    - HTTP-only cookies for refresh tokens (if backend supports)
 *    - Content Security Policy (CSP)
 *    - Regular security audits
 *
 * 4. The sessionKey approach means:
 *    - Encryption key changes per browser session
 *    - Tokens encrypted in one session can't be decrypted in another
 *    - Adds protection against token theft from browser history/backups
 */
