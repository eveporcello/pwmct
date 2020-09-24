# Details for Getting Data

## Person Database

- check out `person.png`

## Ron Fetch

- `https://ron-swanson-quotes.herokuapp.com/v2/quotes`

## Best Buy API

- Docs: `https://bestbuyapis.github.io/api-documentation/`
- baseURL: `https://api.bestbuy.com/v1`

### Camera Route

- `/products(categoryPath.name=digital%20cameras)?format=json&show=sku,name,salePrice,description&sort=${sortBy}&apiKey=${process.env.BB_API_KEY}`

### TV Route

- `/products(categoryPath.name=TVs)?format=json&show=sku,name,salePrice,description&sort=${sortBy}&apiKey=${process.env.BB_API_KEY}`
