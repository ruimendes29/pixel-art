// Login tokens (HS256 JWTs). Uses jose instead of jsonwebtoken, whose
// dependencies crash on Node.js 25+ (they rely on the removed SlowBuffer).
// jose is an ES module, so it is loaded with import() rather than require()
// (some runtimes, like Vercel's functions, don't allow require() of ESM).
const jose = import("jose");

const key = () => new TextEncoder().encode(process.env.TOKEN_KEY);

module.exports.sign = async (payload) => {
  const { SignJWT } = await jose;
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(key());
};

// Resolves to the token's payload ({ username, id, ... }); rejects if invalid.
module.exports.verify = async (token) => {
  const { jwtVerify } = await jose;
  return (await jwtVerify(token, key(), { algorithms: ["HS256"] })).payload;
};
