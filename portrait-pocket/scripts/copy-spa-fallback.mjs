import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const distIndex = resolve("dist", "index.html");
const distFallback = resolve("dist", "404.html");

await copyFile(distIndex, distFallback);

