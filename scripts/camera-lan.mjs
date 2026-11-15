import { createServer } from "node:https";
import { request } from "node:http";
import { readFileSync } from "node:fs";
import { networkInterfaces } from "node:os";

const [ip, cert, key] = process.argv.slice(2);
if (!cert || !key || !Object.values(networkInterfaces()).flat().some(
  (entry) => entry && entry.family === "IPv4" && !entry.internal && entry.address === ip,
)) {
  console.error("Usage: npm run camera:lan -- <Mac LAN IPv4> <certificate> <private key>");
  process.exit(1);
}

const upstreamPort = Number(process.env.CAMERA_STUDIO_PORT ?? 3000);
if (!Number.isInteger(upstreamPort) || upstreamPort < 1 || upstreamPort > 65535) {
  throw new Error("Set CAMERA_STUDIO_PORT to the Next loopback port.");
}
const host = `${ip}:3443`;
createServer({ cert: readFileSync(cert), key: readFileSync(key) }, (req, res) => {
  const { pathname } = new URL(req.url, "https://local.invalid");
  const page = req.method === "GET" && pathname === "/camera/phone";
  const asset = req.method === "GET" && /^\/_next\/static\/(?:[\w./-]|%5B|%5D|%40)+$/i.test(pathname);
  const signal = req.method === "POST" && pathname === "/api/camera-pair" &&
    req.headers.origin === `https://${host}`;

  if (req.headers.host !== host || (!page && !asset && !signal)) {
    res.writeHead(404).end();
    return;
  }
  const upstream = request({
    hostname: "127.0.0.1", port: upstreamPort, path: pathname, method: req.method,
    headers: { host: signal ? host : `127.0.0.1:${upstreamPort}`, ...(signal ? { origin: req.headers.origin, "content-type": "application/json" } : {}) },
  }, (response) => {
    res.writeHead(response.statusCode ?? 502, {
      "Content-Type": response.headers["content-type"] ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    });
    response.pipe(res);
  });
  upstream.setTimeout(10_000, () => upstream.destroy());
  upstream.on("error", () => {
    if (res.headersSent) res.destroy();
    else res.writeHead(502).end();
  });
  res.on("close", () => upstream.destroy());
  req.pipe(upstream);
}).listen(3443, ip, () => console.log(`Phone listener: https://${host}`));
