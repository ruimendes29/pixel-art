// Login tokens (HS256 JWTs). Uses jose instead of jsonwebtoken, whose
// dependencies crash on Node.js 25+ (they rely on the removed SlowBuffer).
const { SignJWT, jwtVerify } = require("jose");

const key = () => new TextEncoder().encode(process.env.TOKEN_KEY);

module.exports.sign = (payload) =>
  new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().sign(key());

// Resolves to the token's payload ({ username, id, ... }); rejects if invalid.
module.exports.verify = async (token) =>
  (await jwtVerify(token, key(), { algorithms: ["HS256"] })).payload;
