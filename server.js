const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;
const BASE_DE_DATOS=process.env.MONGODB_DATABASE;
const COLECCION=process.env.MONGODB_COLECCION;

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// Ruta de inicio o raiz
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la API de Transportes con MongoDB y NodeJS");
});


// a. obtener todos los productos
// Ruta para obtener todos los documentos
app.get("/supermercado", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }
    // Obtener la colección de transportes y convertir los documentos a un array
    const db = client.db(BASE_DE_DATOS);
    const productos = await db.collection(COLECCION).find().toArray();
    res.json(productos);
  } catch (error) {
    // Manejo de errores al obtener los productos
    res.status(500).send("Error al obtener los documentos de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});


// b. obtener un producto por su ID
// Ruta para obtener un documento por su ID
app.get("/supermercado/:codigo", async (req, res) => {
  const prodId = parseInt(req.params.codigo);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }
    // Obtener la colección de documnetos y buscar el documento por su ID
    const db = client.db(BASE_DE_DATOS);
    const coll=db.collection(COLECCION);
    const productos = await coll.findOne({ codigo: prodId });
   
    if (productos) {
      res.json(productos);
    } else {
      res.status(404).send("producto no encontrado");
    }
    
  } catch (error) {
    // Manejo de errores al obtener el documento
    res.status(500).send("Error al obtener el documento de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// c. obtener uno o más productos por parte de su nombre
// En los puntos c y d, ten presente que un usuario puede enviar un parámetro en minúsculas
// o mayúsculas, o combinando ambas.
// Ruta para obtener una transporte por su nombre
app.get("/supermercado/nombre/:nombre", async (req, res) => {
  const productoQuery = req.params.nombre;
  let productoNombre = RegExp('^'+productoQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }
    // Obtener la colección de transportes y buscar el transporte por su Nombre
    const db = client.db(BASE_DE_DATOS);
    const productos = await db
      .collection(COLECCION)
      .find({ nombre: productoNombre })
      .toArray();
    if (productos.length > 0) {
      res.json(productos);
    } else {
      res.status(404).send("producto no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).send("Error al obtener el producto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// d. obtener todos los productos de una categoría específica
    // Obtener la colección de productos y buscar los productos por su categoria (array)
app.get("/supermercado/categoria/:categoria", async (req, res) => {
  const productoCategoriaQuery = req.params.categoria;
  const productoCategoria=RegExp("^"+productoCategoriaQuery+"$","i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    
    const db = client.db(BASE_DE_DATOS);
    const productos = await db
      .collection(COLECCION)
      .find({ categoria: productoCategoria })
      .toArray();

    if (productos.length > 0) {
      res.json(productos);
    } else {
      res.status(404).send("productos no encontrados");
    }
  } catch (error) {
    // Manejo de errores al obtener el elemento
    res.status(500).send("Error al obtener los productos de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});


// e. crear un nuevo producto
// Ruta para agregar un nuevo producto
app.post("/supermercado", async (req, res) => {
  const nuevoProducto = req.body;
  try {
    if (nuevoProducto === undefined) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db(BASE_DE_DATOS);
    const collection = db.collection(COLECCION);
    await collection.insertOne(nuevoProducto);
    console.log("Nuevo producto creado");
    res.status(201).send(nuevoProducto);
  } catch (error) {
    // Manejo de errores al agregar el producto
    res.status(500).send("Error al intentar agregar un nuevo producto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

//Ruta para modificar un recurso
// app.put("/transporte/:id", async (req, res) => {
//   const idtransporte = parseInt(req.params.id);
//   const nuevosDatos = req.body;
//   try {
//     if (!nuevosDatos) {
//       res.status(400).send("Error en el formato de datos a crear.");
//     }
//     // Conexión a la base de datos
//     const client = await connectToDB();
//     if (!client) {
//       res.status(500).send("Error al conectarse a MongoDB");
//     }
//     const db = client.db("transporte");
//     const collection = db.collection("transporte");
//     let resultado=await collection.updateOne({ id: idtransporte }, { $set: nuevosDatos });
//     if (resultado.modifiedCount === 0) {
//       res
//         .status(404)
//         .send("No se encontró ningun recurso con el id seleccionado.");
//     } else {
//       console.log("recurso modificado");
//       res.status(204).send();
//     }
//     // res.status(200).send(nuevosDatos);
//   } catch (error) {
//     // Manejo de errores al modificar el elemento
//     res.status(500).send("Error al modificar el elemento");
//   } finally {
//     // Desconexión de la base de datos
//     await disconnectFromMongoDB();
//   }
// });


// g. eliminar un producto
// Ruta para eliminar un recurso
app.delete("/supermercado/:codigo", async (req, res) => {
  const prodId = parseInt(req.params.codigo);
  try {
    if (!prodId) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }
    // Obtener la colección, buscar el elemento por su codigo y eliminarlo
    const db = client.db(BASE_DE_DATOS);
    const collection = db.collection(COLECCION);
    const resultado = await collection.deleteOne({ codigo: prodId });
    if (resultado.deletedCount === 0) {
      res
        .status(404)
        .send("No se encontró ningun recurso con el codigo seleccionado.");
    } else {
      console.log("recurso Eliminado");
      res.status(204).send();
    }
  } catch (error) {
    // Manejo de errores al obtener los recursos
    res.status(500).send("Error al eliminar el recurso");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// f. modificar el precio de un producto
// Ten presente en el punto e que solo podrás modificar el precio del producto, no sus otros
// parámetros
//Ruta para el metodo PATCH
app.patch("/supermercado/:codigo", async (req, res) => {
  const prodId = parseInt(req.params.codigo);
  
  var nueva_data={
    "_id": req.body._id,
    "codigo": req.body.codigo,
    "nombre": req.body.nombre,
    "precio": req.body.precio,
    "categoria": req.body.categoria
  }
  
  try {
    if (!nueva_data) {res.status(400).send("Error en el formato de datos a crear.");}

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {res.status(500).send("Error al conectarse a MongoDB");}

    const db = client.db(BASE_DE_DATOS);
    const coll = db.collection(COLECCION);
    
    //guardo el producto original en una variable
    let r=await coll.findOne({codigo:prodId});
    if(r.codigo!=nueva_data.codigo||r.nombre!=nueva_data.nombre||r.categoria!=nueva_data.categoria){
      console.error(`NO se pueden modificar estos campos\ncodigo|nombre|categoria : ${r.codigo} | ${r.nombre} | ${r.categoria}`);
    }
    //Modifica unicamente el precio. Si hay otro campo cambiado no modifica nada (resultado.modifiedCount==0)
    let resultado=await coll.updateOne(
      { codigo: prodId,
        $or:[
          {codigo:{$eq: nueva_data.codigo}},
          {nombre:{$eq: nueva_data.nombre}},
          {precio:{$ne: nueva_data.precio}},
          {categoria:{$eq: nueva_data.categoria}}
        ]
       }, 
       { $set: {
        
        precio:nueva_data.precio,
        
       } });

    

       if (resultado.modifiedCount === 0) {
        res
          .status(404)
          .send("No se pudo modificar o no hubo cambios.\nVerificar campos modificados\nVer error en el log");
      } else {
        console.log("se modificó únicamente el precio del producto");
        res.status(204).send();
      }
    
  } catch (error) {
    // Manejo de errores al modificar el recurso
    res.status(500).send("Error al modificar el recurso.");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Lo sentimos, la página que buscas no existe.");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
