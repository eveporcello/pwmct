const { ApolloServer, gql } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");
const fetch = require("node-fetch");

require("dotenv").config();

const typeDefs = gql`
  type Person {
    id: ID!
  }
  type Woman {
    id: ID!
  }
  type Man {
    quote: String!
  }
  type Camera {
    id: ID!
  }
  type TV {
    sku: String!
    name: String!
    salePrice: Float!
  }
  enum TvSort {
    SKU
    NAME
    SALEPRICE
  }
  type Query {
    person: Person!
    woman: Woman!
    man: Man!
    camera: Camera!
    tv(sortBy: TvSort!): TV!
  }
`;

class RonSwansonAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://ron-swanson-quotes.herokuapp.com/v2";
  }
  async getQuote() {
    let data = await this.get("/quotes");
    return { quote: data[0] };
  }
}

const resolvers = {
  Query: {
    man: async (parent, args, { dataSources }) =>
      dataSources.ronAPI.getQuote(),
    tv: async (parent, { sortBy }) => {
      const television = await fetch(
        `https://api.bestbuy.com/v1/products(categoryPath.name="All%20Flat-Screen%20TVs")?format=json&show=sku,name,salePrice&sort=${sortBy}&apiKey=${process.env.BB_API_KEY}`
      )
        .then((res) => res.json())
        .then((data) => data.products[0]);
      return television;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    ronAPI: new RonSwansonAPI()
  })
});

server
  .listen()
  .then(({ url }) => console.log(`Apollo Server running at ${url}`));
