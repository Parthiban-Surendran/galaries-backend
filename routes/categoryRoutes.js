import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
    try {
        // Fetch parent categories only
        if (req.query.isParent === "true") {
            const parentCategories = await prisma.category.findMany({
                where: { isParent: true },
            });
            return res.json(parentCategories);
        }

        // Fetch subcategories based on child IDs
        if (req.query.ids) {
            const ids = req.query.ids.split(",").map(id => parseInt(id));
            const subcategories = await prisma.category.findMany({
                where: { categoryId: { in: ids } },
            });
            return res.json(subcategories);
        }

        // Default: Fetch all categories
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories", error });
    }
});

// Create a new category
// router.post("/", async (req, res) => {
//   try {
//     const { categoryName, childIds } = req.body;
//     const category = await prisma.category.create({
//       data: { categoryName, childIds },
//     });
//     res.json(category);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


router.post("/", async (req, res) => {
  try {
    const { categoryName, childIds = [] } = req.body;

    // Step 1: Create the new category
    const category = await prisma.category.create({
      data: { categoryName,childIds },
    });

    const parentId = category.categoryId;

    // Step 2: Create mappings in categoryMapping if childIds are provided
    if (childIds.length > 0) {
      const mappings = childIds.map(childId => ({
        parentId: parentId,
        childId: childId
      }));

      await prisma.categoryMapping.createMany({
        data: mappings,
      });
    }

    res.status(201).json({ category, message: "Category and mappings created successfully" });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
