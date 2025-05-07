// exportAlgoliaData.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportForAlgolia() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    // Map to minimal format for Algolia
    const formatted = products.map((product) => ({
      objectID: product.productId, // Required by Algolia
      productName: product.productName,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      categoryName: product.category?.categoryName || '',
    }));

    fs.writeFileSync('algoliaData.json', JSON.stringify(formatted, null, 2));
    console.log('✅ Exported reduced product data for Algolia to algoliaData.json');
  } catch (error) {
    console.error('❌ Error exporting for Algolia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportForAlgolia();
