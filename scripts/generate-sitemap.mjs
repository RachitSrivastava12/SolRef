import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.solref.fun";
const ROOT = process.cwd();

async function markdownIds(directory) {
  const fullDir = path.join(ROOT, directory);
  const files = (await readdir(fullDir)).filter((file) => file.endsWith(".md"));
  const ids = [];
  for (const file of files) {
    const source = await readFile(path.join(fullDir, file), "utf8");
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const id = frontmatter?.[1].match(/^id:\s*["']?([a-z0-9-]+)["']?\s*$/m)?.[1];
    if (id) ids.push(id);
  }
  return ids;
}

const staticRoutes = [
  "/", "/innovations", "/deep-dives", "/lifecycle", "/sandwich",
  "/docs", "/learn", "/labs", "/resources",
];
const [conceptIds, trackIds] = await Promise.all([
  markdownIds("content/concepts"),
  markdownIds("content/tracks"),
]);

const routes = [
  ...staticRoutes,
  ...conceptIds.map((id) => `/docs/${id}`),
  ...trackIds.map((id) => `/deep-dives/${id}`),
];

const uniqueRoutes = [...new Set(routes)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  uniqueRoutes.map((route) => `  <url><loc>${SITE}${route}</loc></url>`).join("\n") +
  `\n</urlset>\n`;

await writeFile(path.join(ROOT, "public", "sitemap.xml"), xml, "utf8");
console.log(`Generated sitemap.xml with ${uniqueRoutes.length} URLs.`);