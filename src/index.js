const { ApolloServer, gql } = require("apollo-server");

require("dotenv").config();

const typeDefs = gql`
  type Query {
    welcome: String!
  }
`;

const resolvers = {
  Query: {
    welcome: () => "hello!"
  }
};

const start = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  const PORT = process.env.PORT || 4000;

  server
    .listen({ port: PORT })
    .then(({ port }) =>
      console.log(`Apollo Server running at ${port}`)
    );
};

start();
