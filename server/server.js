//update the back-end server's code to serve up the React front-end code in production
const path = require('path');
const express = require('express');
//import ApolloServer
const { ApolloServer } = require('apollo-server-express');

//import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');

//import middleware function
const { authMiddleware } = require('./utils/auth');

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//start server
const startServer = async () => {
  //create a new Apollo server and pass in our schema data
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });

  //start the Apollo server
  await server.start();

  //integrate our Apollo server with the Express app as middleware
  server.applyMiddleware({ app });

  //log where we can go test our GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);

};

//Initialize the Apollo server
startServer();

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// Serve up static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
