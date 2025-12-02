const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");

dotenv.config();

const sampleProducts = [
  {
    name: "Vestido verde tejido",
    description:
      "Vestido midi de punto con textura suave, ideal para climas templados y looks casuales o elegantes.",
    price: 159000,
    category: "ropa",
    subcategory: "vestidos",
    brand: "Fashionista",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606761568499-6d2451b23c56?w=500",
        alt: "Vestido verde tejido",
        isPrimary: true,
      },
    ],
    stock: 20,
    sku: "VESTIDO001",
    material: "Algodón y poliéster",
    origin: "Colombia",
    tags: ["vestido", "moda femenina", "casual", "verde"],
    features: [
      { name: "Talla", value: "M" },
      { name: "Material", value: "Algodón y poliéster" },
      { name: "Origen", value: "Colombia" },
    ],
    rating: { average: 4.8, count: 112 },
    isFeatured: true,
  },
  {
    name: "Blusa blanca de pepas",
    description:
      "Blusa ligera con estampado de puntos negros, cuello redondo y mangas cortas.",
    price: 89000,
    category: "ropa",
    subcategory: "blusas",
    brand: "Fashionista",
    images: [
      {
        url: "https://images.unsplash.com/photo-1520975918318-3c03a6bda5d1?w=500",
        alt: "Blusa blanca de pepas",
        isPrimary: true,
      },
    ],
    stock: 30,
    sku: "BLUSA001",
    material: "Viscosa",
    origin: "Colombia",
    tags: ["blusa", "moda femenina", "verano", "blanca"],
    features: [
      { name: "Talla", value: "S" },
      { name: "Material", value: "Viscosa" },
      { name: "Origen", value: "Colombia" },
    ],
    rating: { average: 4.7, count: 84 },
    isFeatured: false,
  },
  {
    name: "Pantalón rojo entubado",
    description:
      "Pantalón entubado con tiro alto, realza la figura y ofrece comodidad durante todo el día.",
    price: 129000,
    category: "ropa",
    subcategory: "pantalones",
    brand: "Fashionista",
    images: [
      {
        url: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500",
        alt: "Pantalón rojo entubado",
        isPrimary: true,
      },
    ],
    stock: 25,
    sku: "PANTALON001",
    material: "Algodón stretch",
    origin: "Perú",
    tags: ["pantalón", "moda femenina", "rojo"],
    features: [
      { name: "Talla", value: "M" },
      { name: "Material", value: "Algodón stretch" },
      { name: "Origen", value: "Perú" },
    ],
    rating: { average: 4.6, count: 76 },
    isFeatured: true,
  },
  {
    name: "Blusa azul clara",
    description:
      "Blusa elegante con cuello en V y manga corta, ideal para oficina o salidas casuales.",
    price: 95000,
    category: "ropa",
    subcategory: "blusas",
    brand: "Fashionista",
    images: [
      {
        url: "https://images.unsplash.com/photo-1602810313185-e475b7751f70?w=500",
        alt: "Blusa azul clara",
        isPrimary: true,
      },
    ],
    stock: 40,
    sku: "BLUSA002",
    material: "Rayón",
    origin: "Colombia",
    tags: ["blusa", "moda femenina", "azul"],
    features: [
      { name: "Talla", value: "L" },
      { name: "Material", value: "Rayón" },
      { name: "Origen", value: "Colombia" },
    ],
    rating: { average: 4.5, count: 64 },
    isFeatured: false,
  },
  {
    name: "Enterizo rojo elegante",
    description:
      "Enterizo de corte moderno con cinturón ajustable y escote cruzado, ideal para eventos de noche.",
    price: 179000,
    category: "ropa",
    subcategory: "enterizos",
    brand: "Fashionista",
    images: [
      {
        url: "https://images.unsplash.com/photo-1593032465171-8d4b16f94a7c?w=500",
        alt: "Enterizo rojo elegante",
        isPrimary: true,
      },
    ],
    stock: 15,
    sku: "ENTERIZO001",
    material: "Poliéster",
    origin: "Brasil",
    tags: ["enterizo", "elegante", "rojo"],
    features: [
      { name: "Talla", value: "M" },
      { name: "Material", value: "Poliéster" },
      { name: "Origen", value: "Brasil" },
    ],
    rating: { average: 4.9, count: 90 },
    isFeatured: true,
  },
];

async function seedProducts() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/fashionista";
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB:", mongoose.connection.name);
    console.log("Colección usada por Product:", Product.collection.name);

    await Product.deleteMany({});
    console.log("🗑️ Productos existentes eliminados");

    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✨ ${insertedProducts.length} productos creados exitosamente`);

    console.log("\n📦 Productos insertados:");
    insertedProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - $${p.price}`);
    });
  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión a MongoDB cerrada");
    process.exit(0);
  }
}

seedProducts();
