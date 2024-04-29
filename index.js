//Express imports
import express from 'express';
import http from 'http';
import cors from 'cors';
//import bodyParser from 'body-parser';

//Apollo imports
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

//mongoose imports
import 'dotenv/config';

//Socket.io import
import { Server } from 'socket.io';

// Upload imports
import fileUpload from 'express-fileupload';

//App imports
import { connDB } from './config/config.js';
import typeDefs from './db/schema.js';
import resolvers from './db/resolvers.js';
import socketHandler from './handlers/socket.js';
import uploadHandler from './handlers/upload.js';

//
const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app);
const ioServer = new Server(httpServer);

// ApolloServer constructor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// More required logic for integrating with Express
await server.start();

// Routes
app.use(
    express.static('public')
);

connDB();

// Middleware
app.use('/app',
    cors(),
    express.json(), // en vez de bodyParser.json(),
    expressMiddleware(server)
);

app.use('/upload', fileUpload({ debug: true, uriDecodeFileNames: true }));

// Socket.io
ioServer.on('connection', socketHandler);

// Upload endpoint
app.post('/upload', uploadHandler);

// Server startup
await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
console.log(`🚀 Server ready at http://localhost:${PORT}`);


/*
/////////DB en Sandbox GraphQL/////////////
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './db/schema.js';
import resolvers from './db/resolvers.js';

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at ${url}`);
*/