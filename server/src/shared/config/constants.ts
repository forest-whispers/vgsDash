export const constants = {
    ACCESS_TOKEN_EXPIRY: "15m",
    REFRESH_TOKEN_EXPIRY: "30d",

    REFRESH_COOKIE_NAME: "refreshToken",

    REFRESH_TOKEN_TTL_MS: 30 * 24 * 60 * 60 * 1000,
    REFRESH_COOKIE_MAX_AGE: 30 * 24 * 60 * 60 * 1000,

    REFRESH_COOKIE_PATH: "/api/v1/auth"
} as const;