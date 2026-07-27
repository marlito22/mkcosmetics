import { config } from "dotenv";
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "products");

const PALETTE = ["#fce7f3", "#fbcfe8", "#f9a8d4", "#fdf2f8", "#fde8ef"];

async function createPlaceholder(slug: string, label: string, index: number) {
  const bg = PALETTE[index % PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
    <rect width="800" height="800" fill="${bg}"/>
    <circle cx="400" cy="340" r="150" fill="#ec4899" opacity="0.15"/>
    <text x="400" y="620" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="40" fill="#9d174d">${label
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</text>
  </svg>`;
  const fileName = `${slug}.webp`;
  await sharp(Buffer.from(svg))
    .webp({ quality: 80 })
    .toFile(path.join(UPLOADS_DIR, fileName));
  return `products/${fileName}`;
}

async function main() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  console.log("Limpiando tablas...");
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.productImages);
  await db.delete(schema.products);
  await db.delete(schema.brands);
  await db.delete(schema.categories);

  console.log("Insertando categorías...");
  const cats = await db
    .insert(schema.categories)
    .values([
      { name: "Labios", slug: "labios" },
      { name: "Ojos", slug: "ojos" },
      { name: "Rostro", slug: "rostro" },
      { name: "Cejas", slug: "cejas" },
      { name: "Brochas y accesorios", slug: "brochas-y-accesorios" },
      { name: "Cuidado de la piel", slug: "cuidado-de-la-piel" },
    ])
    .returning();
  const cat = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  console.log("Insertando marcas...");
  const brs = await db
    .insert(schema.brands)
    .values([
      { name: "Trendy", slug: "trendy" },
      { name: "Ushas", slug: "ushas" },
      { name: "Kiss Beauty", slug: "kiss-beauty" },
      { name: "Mia Secret", slug: "mia-secret" },
      { name: "Vogue", slug: "vogue" },
    ])
    .returning();
  const brand = Object.fromEntries(brs.map((b) => [b.slug, b.id]));

  const productData = [
    { name: "Labial mate larga duración", slug: "labial-mate-larga-duracion", price: 25000, categoryId: cat["labios"], brandId: brand["trendy"], featured: true, description: "Labial mate de alta pigmentación con acabado aterciopelado. Dura hasta 8 horas sin retoques." },
    { name: "Brillo labial gloss hidratante", slug: "brillo-labial-gloss-hidratante", price: 18000, categoryId: cat["labios"], brandId: brand["ushas"], featured: false, description: "Gloss con vitamina E que hidrata y da volumen a tus labios con un brillo espejo." },
    { name: "Tinta de labios efecto natural", slug: "tinta-labios-efecto-natural", price: 22000, categoryId: cat["labios"], brandId: brand["kiss-beauty"], featured: true, description: "Tinta de larga duración con acabado natural, resistente al agua." },
    { name: "Paleta de sombras 18 tonos", slug: "paleta-sombras-18-tonos", price: 45000, categoryId: cat["ojos"], brandId: brand["trendy"], featured: true, description: "Paleta con 18 tonos mate y shimmer de alta pigmentación para looks de día y de noche." },
    { name: "Máscara de pestañas 4D", slug: "mascara-pestanas-4d", price: 28000, categoryId: cat["ojos"], brandId: brand["kiss-beauty"], featured: true, description: "Máscara con fibras 4D para pestañas con volumen y longitud extrema, sin grumos." },
    { name: "Delineador líquido punta fina", slug: "delineador-liquido-punta-fina", price: 20000, categoryId: cat["ojos"], brandId: brand["ushas"], featured: false, description: "Delineador de secado rápido con punta ultra fina para un trazo preciso." },
    { name: "Base de maquillaje HD", slug: "base-maquillaje-hd", price: 55000, categoryId: cat["rostro"], brandId: brand["vogue"], featured: true, description: "Base de cobertura media-alta con acabado natural HD. Disponible en varios tonos." },
    { name: "Rubor en polvo compacto", slug: "rubor-polvo-compacto", price: 24000, categoryId: cat["rostro"], brandId: brand["trendy"], featured: false, description: "Rubor sedoso de fácil difuminado para un look fresco y saludable." },
    { name: "Polvo traslúcido matificante", slug: "polvo-translucido-matificante", price: 32000, categoryId: cat["rostro"], brandId: brand["vogue"], featured: false, description: "Polvo suelto que sella el maquillaje y controla el brillo por horas." },
    { name: "Kit de cejas con pomada y brocha", slug: "kit-cejas-pomada-brocha", price: 35000, categoryId: cat["cejas"], brandId: brand["kiss-beauty"], featured: true, description: "Kit completo: pomada resistente al agua, brocha angular y stencils para cejas perfectas." },
    { name: "Lápiz de cejas retráctil", slug: "lapiz-cejas-retractil", price: 15000, categoryId: cat["cejas"], brandId: brand["ushas"], featured: false, description: "Lápiz de trazo suave con cepillo espiral incluido." },
    { name: "Set de brochas x12 profesional", slug: "set-brochas-x12-profesional", price: 60000, categoryId: cat["brochas-y-accesorios"], brandId: brand["mia-secret"], featured: true, description: "Set profesional de 12 brochas sintéticas con estuche." },
    { name: "Esponja de maquillaje beauty blender", slug: "esponja-maquillaje-beauty-blender", price: 12000, categoryId: cat["brochas-y-accesorios"], brandId: brand["mia-secret"], featured: false, description: "Esponja suave que difumina la base sin dejar marcas. Úsala húmeda o seca." },
    { name: "Agua micelar desmaquillante 300ml", slug: "agua-micelar-desmaquillante", price: 30000, categoryId: cat["cuidado-de-la-piel"], brandId: brand["vogue"], featured: false, description: "Limpia y desmaquilla en un solo paso, apta para piel sensible." },
    { name: "Sérum facial con ácido hialurónico", slug: "serum-facial-acido-hialuronico", price: 42000, categoryId: cat["cuidado-de-la-piel"], brandId: brand["mia-secret"], featured: true, description: "Sérum hidratante que rellena y da luminosidad a la piel." },
  ];

  console.log("Insertando productos e imágenes placeholder...");
  for (let i = 0; i < productData.length; i++) {
    const p = productData[i];
    const [inserted] = await db.insert(schema.products).values(p).returning();
    const imagePath = await createPlaceholder(p.slug, p.name.slice(0, 30), i);
    await db.insert(schema.productImages).values({
      productId: inserted.id,
      path: imagePath,
      position: 0,
    });
  }

  console.log(`Seed completado: ${cats.length} categorías, ${brs.length} marcas, ${productData.length} productos.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
