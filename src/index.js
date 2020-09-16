const { ApolloServer, gql } = require("apollo-server");
const fetch = require("node-fetch");

const typeDefs = gql`
  type Person {
    id: ID!
  }
  type Woman {
    id: ID!
  }
  type Man {
    id: ID!
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

const resolvers = {
  Query: {
    person: {}
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server
  .listen()
  .then(({ url }) => console.log(`Apollo Server running at ${url}`));
