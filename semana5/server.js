const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const Producto = require('./models/producto');

// 1. Tipos y operaciones disponibles en GraphQL.
const typeDefs = gql`
  type Producto {
    id: ID!
    nombre: String!
    descripcion: String!
    categoria: String!
    precio: Float!
  }

  input ProductoInput {
    nombre: String!
    descripcion: String!
    categoria: String!
    precio: Float!
  }

  type Alert {
    message: String
  }

  type Query {
    getProductos: [Producto]
    getProductoById(id: ID!): Producto
  }

  type Mutation {
    addProducto(input: ProductoInput!): Producto
    updProducto(id: ID!, input: ProductoInput!): Producto
    delProducto(id: ID!): Alert
  }
`;

// 2. Codigo que ejecuta cada consulta y mutacion.
const resolvers = {
  Query: {
    async getProductos(obj) {
      const productos = await Producto.find();
      return productos;
    },
    async getProductoById(obj, { id }) {
      const producto = await Producto.findById(id);
      return producto;
    }
  },
  Mutation: {
    async addProducto(obj, { input }) {
      const producto = new Producto(input);
      await producto.save();
      return producto;
    },
    async updProducto(obj, { id, input }) {
      const producto = await Producto.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true
      });
      if (producto == null) {
        throw new Error('Producto no encontrado');
      }
      return producto;
    },
    async delProducto(obj, { id }) {
      const producto = await Producto.findByIdAndDelete(id);
      if (producto == null) {
        throw new Error('Producto no encontrado');
      }
      return { message: 'Producto eliminado' };
    }
  }
};

// 3. Servidor web y conexion a la base de datos.
const app = express();
const corsOption = {
  origin: 'http://localhost:8090',
  credentials: false
};
app.use(cors(corsOption));

async function startServer() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nikkei_roll');
  console.log('MongoDB conectado');

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(8090, function () {
    console.log('Nikkei Roll: http://localhost:8090' + apolloServer.graphqlPath);
  });
}

startServer().catch(function (error) {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exitCode = 1;
});
