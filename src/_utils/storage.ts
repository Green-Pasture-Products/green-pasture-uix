import { encryptTransform } from "redux-persist-transform-encrypt";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";
import { jwtDecode } from "jwt-decode";

import {
	ACCESS_TOKEN_EXPIRY_KEYWORD,
	REFRESH_TOKEN_KEYWORD,
	EMAIL_COOKIE_KEYWORD,
	ACCESS_TOKEN_KEYWORD,
	BEARER_TOKEN_KEYWORD,
} from "@/_redux/actions/app.action";
import localforage from "localforage";

interface MyToken {
	exp?: number;
	iat?: number;
	iss?: string;
	sub?: string;
	unique_name: string;
}

export const removeAccessExpiryCookie = (ctx?: { req: any; res: any }) => {
	if (ctx) {
		deleteCookie(ACCESS_TOKEN_EXPIRY_KEYWORD, ctx);
	} else {
		deleteCookie(ACCESS_TOKEN_EXPIRY_KEYWORD);
	}
};

const setAccessExpiryCookie = (time: string, ctx?: { req: any; res: any }) => {
	if (ctx) {
		setCookie(ACCESS_TOKEN_EXPIRY_KEYWORD, time, ctx);
	} else {
		setCookie(ACCESS_TOKEN_EXPIRY_KEYWORD, time);
	}
};

export const removeBearerCookie = (ctx?: { req: any; res: any }) => {
	if (ctx) {
		deleteCookie(BEARER_TOKEN_KEYWORD, ctx);
	} else {
		deleteCookie(BEARER_TOKEN_KEYWORD);
	}
};

export const setBearerCookie = (token: any, ctx?: { req: any; res: any }) => {
	if (ctx) {
		setCookie(BEARER_TOKEN_KEYWORD, token, ctx);
		setAccessTokenExpiry(token, ctx);
	} else {
		setCookie(BEARER_TOKEN_KEYWORD, token);
		setAccessTokenExpiry(token);
	}
};

export const getBearerCookie = (ctx?: { req: any; res: any }) => {
	if (ctx) {
		const accessTokenExpiry = getCookie(BEARER_TOKEN_KEYWORD, ctx);
		return accessTokenExpiry;
	} else {
		const accessTokenExpiry = getCookie(BEARER_TOKEN_KEYWORD);
		return accessTokenExpiry;
	}
};

export const removeAccessToken = (ctx?: { req: any; res: any }) => {
	if (ctx) {
		deleteCookie(ACCESS_TOKEN_KEYWORD, ctx);
	} else {
		deleteCookie(ACCESS_TOKEN_KEYWORD);
	}
};

export const setEmailCookies = (
	email: string,
	ctx?: { req: any; res: any }
) => {
	if (ctx) {
		setCookie(EMAIL_COOKIE_KEYWORD, email, ctx);
	} else {
		setCookie(EMAIL_COOKIE_KEYWORD, email);
	}
};

export const getEmailCookie = (ctx?: {
	req: NextApiRequest;
	res: NextApiResponse;
}) => {
	if (ctx) {
		const email = getCookie(EMAIL_COOKIE_KEYWORD, {
			req: ctx.req,
			res: ctx.res,
		});
		return email as string | undefined;
	} else {
		// On the client-side
		const email = getCookie(EMAIL_COOKIE_KEYWORD);
		return email as string | undefined;
	}
};

export const setAccessToken = (token: string, ctx?: { req: any; res: any }) => {
	if (ctx) {
		setCookie(ACCESS_TOKEN_KEYWORD, token, ctx);
	} else {
		setCookie(ACCESS_TOKEN_KEYWORD, token);

		// Corrected check for client-side

		if (typeof window !== "undefined") {
			window.sessionStorage.setItem(ACCESS_TOKEN_KEYWORD, token);
		}
	}
};

export const getAccessToken = (ctx?: { req: any; res: any }) => {
	if (ctx) {
		const accessToken = getCookie(ACCESS_TOKEN_KEYWORD, ctx);

		return accessToken;
	} else {
		if (typeof window !== "undefined") {
			let accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEYWORD);

			return accessToken;
		}

		// Optionally, fallback to cookies if desired

		return getCookie(ACCESS_TOKEN_KEYWORD);
	}
};

export const setRefreshToken = (token: any, ctx?: { req: any; res: any }) => {
	if (ctx) {
		setCookie(REFRESH_TOKEN_KEYWORD, token, ctx);
	} else {
		setCookie(REFRESH_TOKEN_KEYWORD, token);
	}
};
export const getRefreshToken = (ctx?: { req: any; res: any }) => {
	if (ctx) {
		const accessTokenExpiry = getCookie(REFRESH_TOKEN_KEYWORD, ctx);
		return accessTokenExpiry;
	} else {
		const accessTokenExpiry = getCookie(REFRESH_TOKEN_KEYWORD);
		return accessTokenExpiry;
	}
};
export const removeRefreshToken = (ctx?: { req: any; res: any }) => {
	if (ctx) {
		deleteCookie(REFRESH_TOKEN_KEYWORD, ctx);
	} else {
		deleteCookie(REFRESH_TOKEN_KEYWORD);
	}
};

export const setHttpOnlyRefreshTokenCookie = (token: string) => {
	return fetch("/api/login", {
		method: "post",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ token }),
	});
};

export const refreshHttpOnlyRefreshTokenCookie = () => {
	return fetch("/api/refresh", {
		method: "post",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});
};

export const removeHttpOnlyRefreshTokenCookie = () => {
	return fetch("/api/logout", {
		method: "post",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});
};

export const setAccessTokenExpiry = (
	access_token: string,
	ctx?: { req: any; res: any }
) => {
	const decoded = jwtDecode<MyToken>(access_token);
	if (decoded?.exp) {
		if (ctx) {
			setAccessExpiryCookie(decoded.unique_name, ctx);
		} else {
			setAccessExpiryCookie(decoded.unique_name);
		}
	}
};

export const getAccessTokenExpiry = (ctx?: { req: any; res: any }) => {
	if (ctx) {
		const accessTokenExpiry = getCookie(ACCESS_TOKEN_EXPIRY_KEYWORD, ctx);
		return accessTokenExpiry;
	} else {
		const accessTokenExpiry = getCookie(ACCESS_TOKEN_EXPIRY_KEYWORD);
		return accessTokenExpiry;
	}
};

export const encryptionTransform = encryptTransform({
	secretKey: process.env.REACT_APP_PERSIST_SECRET || "default_fallback_key",
	onError: (error) => {
		console.error("Redux Persist Encryption Error:", error);
	},
});

localforage.config({
	name: "gr33nP@stur3", // your app name
	storeName: "gR33nP@sTuR3_0Rg@n1Cs_St0R3", // the IndexedDB store name
});

export default localforage;
