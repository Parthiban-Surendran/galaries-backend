import prisma from "./db.js";

async function seedCategories() {
  try {
    const parentCategories = [
      { categoryName: "What's New", childIds: [] },
      { categoryName: "Women", childIds: [] },
      { categoryName: "Men", childIds: [] },
      { categoryName: "Child", childIds: [] },
      { categoryName: "Beauty", childIds: [] },
      { categoryName: "Home", childIds: [] },
    ];

    for (const category of parentCategories) {
      await prisma.category.create({ data: category });
    }

    console.log("Parent categories inserted successfully!");
  } catch (error) {
    console.error("Error inserting categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
