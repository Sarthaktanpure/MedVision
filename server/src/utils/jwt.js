const crypto = require("crypto");

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString();
}

function signToken(payload, secret, expiresInSeconds = 60 * 60 * 24) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64");
  const encodedSignature = signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

  return `${data}.${encodedSignature}`;
}

function verifyToken(token, secret) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Invalid token format");
  }

  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

  if (expectedSignature.length !== encodedSignature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(encodedSignature))) {
    throw new Error("Token signature mismatch");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}

module.exports = {
  signToken,
  verifyToken,
};
