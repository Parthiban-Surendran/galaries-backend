import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./db.js";



import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";


// ✅ Algolia setup
import { algoliasearch } from "algoliasearch";
const appID = "ZPU1U1EEZI";
const apiKey = "ae436bee2efe3715dd5c1f3647316e1e";
const indexName = "productIndex"; // Your real indexed data in Algolia
const client = algoliasearch(appID, apiKey);


// Required to use __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve images statically
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);



// Add favorite
app.post('/favourites', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const fav = await prisma.favourite.create({
      data: { userId, productId },
    });
    res.json(fav);
  } catch (err) {
    res.status(400).json({ error: 'Already in favourites or invalid input' });
  }
});

// Remove favorite
app.delete('/favourites', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    await prisma.favourite.deleteMany({
      where: {
         
          userId: userId,
          productId: productId
        
      }
    });
    
    res.json({ message: 'Removed from favourites' });
  } catch (err) {
    res.status(400).json({ error: err.message});
  }
});

app.delete('/deleteFavourites', async (req, res) => {
  const { userId } = req.body;
  console.log("UserId", userId);

  try {
    const temp = await prisma.favourite.deleteMany({
      where: {
        userId: userId,
      },
    });

    res.json({ message: 'Removed from favourites' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Not in favourites' });
  }
});



// Get all favourites for a user
app.get('/favourites/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const favourites = await prisma.favourite.findMany({
      where: { userId },
      include: { product: true },
    });
    if(!favourites.length){
      return res.json([])
    }
    res.json(favourites);
  } catch (error) {
    console.log("Error",error.message)
    res.json(error.message);
  }
});




app.get("/search", async (req, res) => {
  console.log("HIT")
  const query = req.query.q || "";
  console.log(query)

  try {
    const result = await client.search([
      {
        indexName,
        query,
      },
    ]);
    
    res.json(result.results[0].hits);
  } catch (error) {
    console.error("Algolia Search Error:", error.message);
    res.status(500).json({ error: "Failed to search" });
  }
});



// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
