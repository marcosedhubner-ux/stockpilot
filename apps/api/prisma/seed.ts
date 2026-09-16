import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Passw0rd!123", 12);

  const admin = await prisma.staff.upsert({
    where: { email: "admin@stockpilot.dev" },
    update: {},
    create: { fullName: "Morgan Lee", email: "admin@stockpilot.dev", passwordHash, role: "ADMIN" },
  });

  const staff = await prisma.staff.upsert({
    where: { email: "staff@stockpilot.dev" },
    update: {},
    create: { fullName: "Riley Chen", email: "staff@stockpilot.dev", passwordHash, role: "STAFF" },
  });

  const supplierA = await prisma.supplier.upsert({
    where: { id: "seed-supplier-northwind" },
    update: {},
    create: {
      id: "seed-supplier-northwind",
      name: "Northwind Distribution",
      email: "orders@northwind.example",
      phone: "+1-555-0100",
    },
  });

  const supplierB = await prisma.supplier.upsert({
    where: { id: "seed-supplier-atlas" },
    update: {},
    create: { id: "seed-supplier-atlas", name: "Atlas Components", email: "sales@atlas.example" },
  });

  const productSeeds = [
    { sku: "WH-1001", name: "Wireless Mouse", category: "Peripherals", unitCost: 8.5, reorderPoint: 20, reorderQuantity: 100, quantityOnHand: 6, supplierId: supplierA.id },
    { sku: "WH-1002", name: "Mechanical Keyboard", category: "Peripherals", unitCost: 22.0, reorderPoint: 15, reorderQuantity: 60, quantityOnHand: 42, supplierId: supplierA.id },
    { sku: "WH-2001", name: "USB-C Cable 2m", category: "Cables", unitCost: 2.1, reorderPoint: 50, reorderQuantity: 300, quantityOnHand: 18, supplierId: supplierB.id },
    { sku: "WH-2002", name: "27in Monitor", category: "Displays", unitCost: 145.0, reorderPoint: 5, reorderQuantity: 20, quantityOnHand: 11, supplierId: supplierB.id },
    { sku: "WH-3001", name: "Laptop Stand", category: "Accessories", unitCost: 14.75, reorderPoint: 10, reorderQuantity: 40, quantityOnHand: 3, supplierId: supplierA.id },
  ];

  const products = [];
  for (const seed of productSeeds) {
    const { quantityOnHand, ...rest } = seed;
    const product = await prisma.product.upsert({
      where: { sku: seed.sku },
      update: {},
      create: { ...rest, quantityOnHand },
    });
    products.push(product);

    const existingMovement = await prisma.stockMovement.findFirst({ where: { productId: product.id } });
    if (!existingMovement) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "RECEIVED",
          quantity: quantityOnHand,
          note: "Initial stock load",
          recordedById: admin.id,
        },
      });
    }
  }

  const monitor = products.find((p) => p.sku === "WH-2001");
  if (monitor) {
    const existingOrder = await prisma.purchaseOrder.findFirst({
      where: { supplierId: supplierB.id, status: "SUBMITTED" },
    });
    if (!existingOrder) {
      await prisma.purchaseOrder.create({
        data: {
          supplierId: supplierB.id,
          status: "SUBMITTED",
          submittedAt: new Date(),
          items: {
            create: [{ productId: monitor.id, quantityOrdered: 300, unitCost: 2.1 }],
          },
        },
      });
    }
  }

  console.log(`Seed complete. Admin login: ${admin.email} / Passw0rd!123`);
  console.log(`Staff login: ${staff.email} / Passw0rd!123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
