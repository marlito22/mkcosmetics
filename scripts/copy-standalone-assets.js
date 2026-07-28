// next build con output:"standalone" no copia public/ ni .next/static,
// por lo que cualquier deploy que solo corra `npm run build` sirve un
// standalone incompleto (sin imagenes, CSS, JS de cliente). Este script
// corre automaticamente despues del build (ver "postbuild" en package.json)
// para mantener el standalone siempre sincronizado, sin depender de que
// el proceso de deploy se acuerde de copiarlo a mano.
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.log("[postbuild] No se encontro .next/standalone, se omite la copia.");
  process.exit(0);
}

const copies = [
  [path.join(root, "public"), path.join(standaloneDir, "public")],
  [path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static")],
];

for (const [from, to] of copies) {
  if (!fs.existsSync(from)) continue;
  fs.cpSync(from, to, { recursive: true });
  console.log(`[postbuild] Copiado ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}
