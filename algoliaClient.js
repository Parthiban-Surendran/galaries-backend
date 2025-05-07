// // Import the Algolia search client
// import { algoliasearch } from "algoliasearch";
// // Initialize the Algolia client with your credentials
// const client = algoliasearch('ZPU1U1EEZI', 'ae436bee2efe3715dd5c1f3647316e1e');

// // Initialize the index
// const productIndex = client.initIndex('products');

// // Export the product index for use in other parts of your app
// export default productIndex;



// // File: helloAlgolia.mjs
// import { algoliasearch } from "algoliasearch";

// const appID = "ZPU1U1EEZI";
// // API key with `addObject` and `editSettings` ACL
// const apiKey = "ae436bee2efe3715dd5c1f3647316e1e";
// const indexName = "instantsearch-app";

// const client = algoliasearch(appID, apiKey);

// const record = {objectID: "object-1", name: "test record"};

// // Add record to an index
// const { taskID } = await client.saveObject({
//   indexName,
//   body: record,
// });

// // Wait until indexing is done
// await client.waitForTask({
//   indexName,
//   taskID,
// });


// // Search for "test"
// const { results } = await client.search({
//   requests: [
//     {
//       indexName,
//       query: "shirt",
//     },
//   ],
// });

// console.log(JSON.stringify(results));


// File: helloAlgolia.mjs
import { algoliasearch } from "algoliasearch";
// Your Algolia App ID and API Key
const appID = "ZPU1U1EEZI";
const apiKey = "ae436bee2efe3715dd5c1f3647316e1e";
const indexName = "instantsearch-app"; // Use the name of the index where your real data is stored

// Initialize Algolia client
const client = algoliasearch(appID, apiKey);

// Initialize the index
const result = await client.search([
    {
      indexName: 'exportedData',
      query: 'shirt',
    },
  ]);

  
  console.log(result.results[0].hits.length);