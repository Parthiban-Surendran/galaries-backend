const { algoliasearch, instantsearch } = window;

const searchClient = algoliasearch('ZPU1U1EEZI', '988926918f646e4b0d9c9e1e8891dd76');

const search = instantsearch({
  indexName: 'exportedData',
  searchClient,
  future: { preserveSharedStateOnUnmount: true },
  
});


search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
<article>
  <img src=${ hit.imageUrl } alt=${ hit.productName } />
  <div>
    <h1>${components.Highlight({hit, attribute: "productName"})}</h1>
    <p>${components.Highlight({hit, attribute: "description"})}</p>
    <p>${components.Highlight({hit, attribute: "categoryName"})}</p>
  </div>
</article>
`,
    },
  }),
  instantsearch.widgets.configure({
    hitsPerPage: 8,
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();

