const { ApolloServer, gql } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");
const fetch = require("node-fetch");

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
    id: ID!
  }
  type Query {
    person: Person!
    woman: Woman!
    man: Man!
    camera: Camera!
    tv: TV!
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
      dataSources.ronAPI.getQuote()
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
