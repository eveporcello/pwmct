const { ApolloServer, gql } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");
const fetch = require("node-fetch");
const MongoClient = require("mongodb").MongoClient;

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
    woman: Woman!
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
  async getTV(sortBy) {
    const tv = await this.get(
      `/products(categoryPath.name=TVs)?format=json&show=sku,name,salePrice,description&sort=${sortBy}&apiKey=${process.env.BB_API_KEY}`
    ).then((data) => data.products[0]);
    return tv;
  }
  async getCamera(sortBy) {
    const camera = await this.get(
      `/products(categoryPath.name=digital%20cameras)?format=json&show=sku,name,salePrice,description&sort=${sortBy}&apiKey=${process.env.BB_API_KEY}`
    ).then((data) => data.products[0]);
    return camera;
  }
}

const resolvers = {
  Query: {
    person: async (parent, { username }, { people }) => {
      return people.findOne({ username });
    },
    man: async () => {
      const quoteArray = await fetch(
        "https://ron-swanson-quotes.herokuapp.com/v2/quotes"
      ).then((res) => res.json());
      return {
        quote: quoteArray[0]
      };
    },
    tv: async (parent, { sortBy }, { dataSources }) =>
      dataSources.bestBuyAPI.getTV(sortBy),
    camera: async (parent, { sortBy }, { dataSources }) =>
      dataSources.bestBuyAPI.getCamera(sortBy)
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
  server
    .listen()
    .then(({ url }) =>
      console.log(`Apollo Server running at ${url}`)
    );
};

start();
