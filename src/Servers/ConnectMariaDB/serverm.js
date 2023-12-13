const express = require('express');
const mariadb = require('mariadb');
const { pool, connect } = require('mssql');
const app = express();
const port = 4070;

// Config database connection
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Handle test connection
app.post('/startServer', async (req, res) => {
  try {
    // Get values from the request body
    const { nameInstance, dbName, port, user, password } = req.body;
    // Create connection to database
    const config = {
      host: nameInstance,
      port: port,
      user: user,
      password: password,
      database: dbName,
      connectionLimit: 5,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };
    console.log(config);
    const pool = mariadb.createPool(config);
    const connection = await pool.getConnection();
    const result = await connection.query('Show tables;');
    //guardar las tablas en un arreglo
    var tables = [];
    for (var i = 0; i < result.length; i++) {
      if (result[i].Tables_in_proyecto != 'bitacora') {
        tables.push(result[i].Tables_in_proyecto);
      }
    }
    //mandar las tablas como respuesta
    res.send(tables);
    console.log(tables);
    console.log('se enviaron las tablas');
    console.log('Connection stablished successfully!');
    connection.release();
    pool.end();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post('/disconnectConection', async (req, res) => {
  try {
    // Close connection
    mariadb.release();
    // Send success response
    res.status(200).send('Connection closed successfully!');
    console.log('Connection closed successfully!');
    
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
    
  }
}
);

app.post('/makeQuery', async (req, res) => {
  try {
    //make a query
    const { nameInstance, dbName, port, user, password } = req.body;
    // Create connection to database
    const config = {
      host: nameInstance,
      port: port,
      user: user,
      password: password,
      database: dbName,
      connectionLimit: 5,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };

    const pool = mariadb.createPool(config);
    const connection = await pool.getConnection();
    const result = await connection.query('Show tables;');
    //guardar las tablas en un arreglo
    var tables = [];
    for (var i = 0; i < result.length; i++) {
      tables.push(result[i].Tables_in_proyecto);
    }

    connection.release();
  pool.end();

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
);

app.post('/makeTriggers', async (req, res) => {
  /* esta es la bitacora
  CREATE TABLE bitacora (
  id_bitacora INT AUTO_INCREMENT NOT NULL PRIMARY KEY, 
  evento VARCHAR(15) NOT NULL CHECK(evento IN('I', 'U', 'D')),
  inicio_sesion VARCHAR(50),
  usuario VARCHAR(50),
  aplicacion VARCHAR(60),
  hostname VARCHAR(30),
  fecha TIMESTAMP NOT NULL DEFAULT NOW(),
  tabla VARCHAR(300),
  atributos VARCHAR(300),
  newDatos VARCHAR(300),
  oldDatos VARCHAR(300)
  comm VARCHAR(2) DEFAULT 0,
CHECK(comm IN(0, 1));
);

  */
 console.log("entro a makeTriggers");
  try {
    const { nameInstance, dbName, port, user, password } = req.body;
    // Create connection to database
    const config = {
      host: nameInstance,
      port: port,
      user: user,
      password: password,
      database: dbName,
      connectionLimit: 5,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };
    const pool = mariadb.createPool(config);
    const connection = await pool.getConnection();
    const result = await connection.query('Show tables;');
    //guardar las tablas en un arreglo
    var tables = [];
    for (var i = 0; i < result.length; i++) {
      tables.push(result[i].Tables_in_proyecto);
    }
    //revisar si existe un trigger insert, update, delete en cada tabla
  
    for (var i = 0; i < tables.length; i++) {
      var trigger = await connection.query('SHOW TRIGGERS LIKE "' + tables[i] + '";');
      var palabra = trigger[0];
      //si no existe un trigger insert, update, delete en cada tabla se crea
      if(palabra == undefined && tables[i] != 'bitacora'){
        //agregar los atributos de la tabla
        var atributos = await connection.query('SHOW COLUMNS FROM ' + tables[i] + ';');
        //tomar el campo field de cada atributo
        var atributos2 = [];
        var atributos3 = [];
        var atributos4 = [];
        for (var j = 0; j < atributos.length; j++) {
          atributos2.push(atributos[j].Field);
          atributos3.push('New.'+atributos[j].Field + ',\',\'');
          atributos4.push('Old.'+atributos[j].Field + ',\',\'');
        } 
        atributos2 = atributos2.toString();
        //convertir el arreglo en un string
        atributos3 = atributos3.toString();
        atributos4 = atributos4.toString();
        //quitar la ultima coma
        atributos3 = atributos3.substring(0, atributos3.length - 4);
        atributos4 = atributos4.substring(0, atributos4.length - 4);
        console.log(atributos3);
        //crear trigger insert
        var query = 'CREATE OR REPLACE TRIGGER trigger_' + tables[i] + '_insert AFTER INSERT ON ' + tables[i] + 
        ' FOR EACH ROW INSERT INTO bitacora (evento, inicio_sesion, usuario, aplicacion, hostname, tabla, atributos, newDatos, oldDatos)  VALUES(\'I\', CURRENT_USER(), USER(), CONNECTION_ID(), @@hostname,\'' + tables[i] + '\',\'' + atributos2 + '\', CONCAT(' + atributos3+ '),NULL);';
        //ejecutar el query
        var triggerInsert = await connection.query(query);
        console.log(query);
        console.log(triggerInsert);
        console.log('se creo el trigger insert');
        //crear trigger update
        var queryUpdate = 'CREATE OR REPLACE TRIGGER trigger_' + tables[i] + '_update AFTER UPDATE ON ' + tables[i] + 
        ' FOR EACH ROW INSERT INTO bitacora (evento, inicio_sesion, usuario, aplicacion, hostname, tabla, atributos, newDatos, oldDatos)  VALUES(\'U\', CURRENT_USER(), USER(), CONNECTION_ID(), @@hostname,\'' + tables[i] + '\',\'' + atributos2 + '\', CONCAT(' + atributos3+ '),CONCAT('+ atributos4 + '));';
        console.log(queryUpdate);
        var triggerUpdate = await connection.query(queryUpdate);
        console.log(triggerUpdate);
        console.log('se creo el trigger update');
        //crear trigger delete
        var queryDelete = 'CREATE OR REPLACE TRIGGER trigger_' + tables[i] + '_delete AFTER DELETE ON ' + tables[i] + 
        ' FOR EACH ROW INSERT INTO bitacora (evento, inicio_sesion, usuario, aplicacion, hostname, tabla, atributos, newDatos, oldDatos)  VALUES(\'D\', CURRENT_USER(), USER(), CONNECTION_ID(), @@hostname,\'' + tables[i] + '\',\'' + atributos2 + '\', NULL ,CONCAT('+ atributos4 + '));';
        console.log(queryDelete);
        var triggerDelete = await connection.query(queryDelete);
        console.log(triggerDelete);
        console.log('se creo el trigger delete');

        //cerrar la conexion

      } else {
        console.log('ya existen los triggers de la tabla: '+ tables[i]);
      }
    }

    connection.release();
    pool.end();

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }

});
//metodo para obtener el codigo SQL para pasar las tablas a la base de datos
app.post('/getTablas', async (req, res) => {
  try {
    // Get values from the request body
    const { nameInstance, dbName, port, user, password, tableName} = req.body;
    // Create connection to database
    const config = {
      host: nameInstance,
      port: port,
      user: user,
      password: password,
      database: dbName,
      connectionLimit: 5,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };
    console.log(config);
    const pool = mariadb.createPool(config);
    const connection = await pool.getConnection();
    var query = [];
    var temp = [];
    const result2 = await connection.query('DESCRIBE ' + tableName + ';');
    query.push(result2);
    const result = await connection.query('SELECT * FROM ' + tableName + ';');
    query.push(result);
    const result3 = await connection.query('SHOW CREATE TABLE ' + tableName + ';');
    temp.push(result3[0]['Create Table']);
    //verificar si tiene constraint
    if(temp[0].includes('CONSTRAINT')){
      console.log('Tiene constraint');
      var Reference = temp[0].substring(temp[0].indexOf('CONSTRAINT'));
      Reference = Reference.substring(Reference.indexOf(Reference.match(/REFERENCE/)));
      Reference = Reference.substring(Reference.indexOf('`')+1);
      var Reference2 = Reference.substring(Reference.indexOf('(')+2);
      Reference2 = Reference2.substring(0, Reference2.indexOf(')')-1);
      console.log(Reference2);
      Reference = Reference.substring(0, Reference.indexOf('`'));
      temp.push(Reference);
      temp.push(Reference2);
      temp.shift();
     } else{
      temp.push('0');
      temp.push('0');
      temp.shift();
     }
    query.push(temp[0]);
    query.push(temp[1]);
    res.send(query);
    connection.release();
    pool.end();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }

 connection.release();
  pool.end();
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
