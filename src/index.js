const { ApolloServer, gql } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");
const fetch = require("node-fetch");
const MongoClient = require("mongodb").MongoClient;
const women = require("./women.json");

require("dotenv").config();

const typeDefs = gql`
  type Person {
    _id: ID!
    username: String!
    name: String!
    address: String!
    birthdate: String!
    email: String!
  }
  type Woman {
    id: ID!
    first: String!
    last: String!
    location: String!
  }
  type Man {
    quote: String!
  }
  type Camera {
    sku: String!
    name: String!
    salePrice: Float!
  }
  type TV {
    sku: String!
    name: String!
    salePrice: Float!
  }
  enum SortCategories {
    SKU
    NAME
  }
  type Query {
    person(username: String!): Person!
    woman(id: ID!): Woman!
    man: Man!
    camera(sortBy: SortCategories): Camera!
    tv(sortBy: SortCategories!): TV!
  }
`;

class BestBuyAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.bestbuy.com/v1";
  }
  async getCamera(sortBy) {
    const camera = await this.get(
      `/products(categoryPath.name=digital%20cameras)?format=json&show=sku,name,salePrice,description&sort=${sortBy}&apiKey=${process.env.BB_API_KEY}`
    ).then((data) => data.products[0]);
    return camera;
  }
  async getTV(sortBy) {
    const tv = await this.get(
      `/products(categoryPath.name=TVs)?format=json&show=sku,name,salePrice,description&sort=${sortBy}&apiKey=${process.env.BB_API_KEY}`
    ).then((data) => data.products[0]);
    return tv;
  }
}

const resolvers = {
  Query: {
    person: async (parent, { username }, { people }) => {
      return people.findOne({ username });
    },
    woman: (parent, { id }) => women.find((woman) => id == woman.id),
    man: async () => {
      const [quote] = await fetch(
        "https://ron-swanson-quotes.herokuapp.com/v2/quotes"
      ).then((res) => res.json());
      return {
        quote
      };
    },
    camera: async (parent, { sortBy }, { dataSources }) =>
      dataSources.bestBuyAPI.getCamera(sortBy),
    tv: async (parent, { sortBy }, { dataSources }) =>
      dataSources.bestBuyAPI.getTV(sortBy)
  }
};

const start = async () => {
  const uri = process.env.MONGO_URI;
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = client.db();
  const context = async () => {
    const people = db.collection("customers");
    return { people };
  };
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    dataSources: () => ({
      bestBuyAPI: new BestBuyAPI()
    })
  });

  const PORT = process.env.PORT || 4000;

  server
    .listen({ port: PORT })
    .then(({ port }) =>
      console.log(`Apollo Server running at ${port}`)
    );
};

start();
