// prisma/seed.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { categoryId: 30, childIds: [142, 143, 144] },
    { categoryId: 31, childIds: [145, 146, 147, 148] },
    { categoryId: 32, childIds: [149, 150, 151] },
    { categoryId: 33, childIds: [152, 153, 154, 155] },
    { categoryId: 34, childIds: [156, 157, 158, 159] },
  ];

  for (const update of updates) {
    await prisma.category.update({
      where: { categoryId: update.categoryId }, // change to `id` if your primary key is `id`
      data: { childIds: update.childIds },
    });
    console.log(`✅ Updated category ${update.categoryId} with childIds: ${update.childIds}`);
  }
}

main()
  .then(() => {
    console.log('🎉 All updates completed!');
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error('❌ Error updating categories:', e);
    prisma.$disconnect();
    process.exit(1);
  });
