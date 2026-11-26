import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const MAX_BODY_BYTES = 15 * 1024 * 1024; // 15 MB for high-resolution portfolio uploads

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error("Payload too large (max 15 MB)"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function portfolioCmsPlugin(): Plugin {
  const worksFile = path.resolve(__dirname, "src/data/works.json");
  const uploadsDir = path.resolve(__dirname, "public/uploads");

  return {
    name: "portfolio-local-cms",
    configureServer(server) {
      server.middlewares.use("/api/works", async (req, res, next) => {
        if (req.method === "GET") {
          try {
            const raw = fs.readFileSync(worksFile, "utf8");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(raw);
          } catch (error) {
            sendJson(res, 500, {
              error: error instanceof Error ? error.message : "Failed to read works.json",
            });
          }
          return;
        }

        if (req.method === "PUT") {
          try {
            const body = await readJsonBody(req);
            if (!Array.isArray(body)) {
              sendJson(res, 400, { error: "Expected an array of works" });
              return;
            }
            fs.mkdirSync(path.dirname(worksFile), { recursive: true });
            fs.writeFileSync(worksFile, JSON.stringify(body, null, 2) + "\n", "utf8");
            sendJson(res, 200, { ok: true, count: body.length });
          } catch (error) {
            sendJson(res, 400, {
              error: error instanceof Error ? error.message : "Failed to save works.json",
            });
          }
          return;
        }

        next();
      });

      server.middlewares.use("/api/upload", async (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        try {
          const body = (await readJsonBody(req)) as { filename?: string; dataUrl?: string };
          if (!body.dataUrl || typeof body.dataUrl !== "string") {
            sendJson(res, 400, { error: "Missing image dataUrl" });
            return;
          }

          const match = body.dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,(.+)$/i);
          if (!match) {
            sendJson(res, 400, { error: "Unsupported image format" });
            return;
          }

          const extMap: Record<string, string> = {
            png: "png",
            jpeg: "jpg",
            jpg: "jpg",
            webp: "webp",
            gif: "gif",
            "svg+xml": "svg",
          };
          const ext = extMap[match[1].toLowerCase()] ?? "png";
          const baseName = (body.filename ?? "artwork")
            .replace(/\.[^/.]+$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48) || "artwork";

          const uniqueName = `${Date.now()}-${baseName}.${ext}`;
          fs.mkdirSync(uploadsDir, { recursive: true });
          const buffer = Buffer.from(match[2], "base64");
          fs.writeFileSync(path.join(uploadsDir, uniqueName), buffer);

          sendJson(res, 200, { url: `/uploads/${uniqueName}` });
        } catch (error) {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : "Upload failed",
          });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    portfolioCmsPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
