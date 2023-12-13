const express = require('express');
const mssql = require('mssql');

const app = express();
const port = 4080;

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
    const { nameInstance, dbName, user, password } = req.body;
    // Create connection to database
    const config = {
      server: "localhost",
      database: "proyecto",
      user: "alexvila",
      password: "manzana10",
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };
    const pool = await mssql.connect(config);
    // Send success response
    const result = await mssql.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES');
    var tables = [];
    for (var i = 0; i < result.recordset.length; i++) {
      if (result.recordset[i].TABLE_NAME != 'bitacora') {
        tables.push(result.recordset[i].TABLE_NAME);
      }
    }
    res.send(tables);
    console.log('Connection stablished successfully!BITCHES');


  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post('/disconnectConection', async (req, res) => {
  try {
    // Close connection
    mssql.close();
    // Send success response
    res.status(200).send('Connection closed successfully!');
    console.log('Connection closed successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
);
app.post('/deleteTableSecret', async (req, res) => {
  //revisa si existe la tabla
  try {
    var queryTable = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${req.body.nombreTabla}'`;
    console.log('este es el queryTable: ', queryTable);
    const result = await mssql.query(queryTable);
    console.log('este es el result: ', result);
    if (result.recordset.length != 0) {
      console.log('=======================================ENTRO A ACTUALIZAR TABLA===============================================');
      const query = `
BEGIN
    EXEC sp_MSForEachTable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
    EXEC sp_MSForEachTable 'DROP TABLE ?';
    EXEC sp_MSForEachTable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
END
`;
      res.send('HUBO MODIFICACIONES');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }


});
app.post('/makeQuery', async (req, res) => {
  try {
    //make a query
    const result = await mssql.query`select * from fabricante`;
    console.log('this is the result of the query: ', result);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
);

app.post('/constraintTable', async (req, res) => {
  try {
    //verificar si existe la tabla
    console.log('================================entro a constraintTable===================================================');
    console.log('este es el body: ', req.body);
    const result = await mssql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ${req.body.tableName}`;
    if (result.recordset.length == 0) {
      res.send('La tabla no existe')
      console.log('La tabla no existe');
    } else {
      res.send('La tabla existe')
      console.log('La tabla existe');
    }


  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
);
app.post('/createTable2', async (req, res) => {
  try {
    console.log('================================entro a createTable===================================================');


    var queryStructure = [];
    console.log('este es el body: ', req.body);
    if (req.body.constraint != '0') {
      const result = await mssql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ${req.body.constraint}`;
      console.log('este es el result: ', result);
      if (result.recordset.length == 0) {
        throw new Error('es necesario crear la tabla primero: ' + req.body.constraint);
      }
    }

    //obtener el FIELD de queryTabla
    // Suponiendo que createTableMariaDB es tu estructura
    var campoConPrimaryKey = req.body.QueryTabla.find(column => column.Key === 'PRI');
    console.log('este es el campoConPrimaryKey: ', campoConPrimaryKey.Field);


    var queryInsert = convertInsertQuery(req.body.queryInsert, req.body.nombreTabla, campoConPrimaryKey.Field);
    //mandar query 
    if (queryInsert != 'undefined') {
      const result3 = await mssql.query(queryInsert);
    }
    const result2 = await mssql.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES');
    var tables = [];
    for (var i = 0; i < result2.recordset.length; i++) {
      if (result2.recordset[i].TABLE_NAME != 'bitacora') {
        tables.push(result2.recordset[i].TABLE_NAME);
      }
    }
    console.log('TABLAS DESPUES DE CREAR LA TABLA: ', tables);
    res.send(tables);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
);
app.post('/deleteTable', async (req, res) => {
  try {
    console.log('================================entro a deleteTable===================================================');
    console.log('este es el body: ', req.body);
    var queryTable = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${req.body.tableName}'`;
    console.log('este es el queryTable: ', queryTable);
    const result = await mssql.query(queryTable);
    if (result.recordset.length == 0) {
      res.send('La tabla no existe')
      console.log('La tabla no existe');
    } else {
      var queryDrop = `DROP TABLE ${req.body.tableName}`;
      console.log('este es el queryDrop: ', queryDrop);
      const result2 = await mssql.query(queryDrop);
      const result3 = await mssql.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES');
      var tables = [];
      for (var i = 0; i < result3.recordset.length; i++) {
        if (result3.recordset[i].TABLE_NAME != 'bitacora') {
          tables.push(result3.recordset[i].TABLE_NAME);
        }
      }
      console.log('TABLAS DESPUES DE ELIMINAR LA TABLA: ', tables);
      res.send(tables);
    }

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post('/createTable', async (req, res) => {
  try {
    console.log('================================entro a createTable===================================================');


    var queryStructure = [];
    console.log('este es el body: ', req.body);
    if (req.body.constraint != '0') {
      const result = await mssql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ${req.body.constraint}`;
      console.log('este es el result: ', result);
      if (result.recordset.length == 0) {
        throw new Error('es necesario crear la tabla primero: ' + req.body.constraint);
      }
    }

    var query = convertCreateTable(req.body.QueryTabla, req.body.nombreTabla, req.body.constraint, req.body.referenceID);
    //obtener el FIELD de queryTabla
    // Suponiendo que createTableMariaDB es tu estructura
    var campoConPrimaryKey = req.body.QueryTabla.find(column => column.Key === 'PRI');
    console.log('este es el campoConPrimaryKey: ', campoConPrimaryKey.Field);


    var queryInsert = convertInsertQuery(req.body.queryInsert, req.body.nombreTabla, campoConPrimaryKey.Field);
    //mandar query 
    const result = await mssql.query(query);
    if (queryInsert != 'undefined') {
      const result3 = await mssql.query(queryInsert);
    }
    const result2 = await mssql.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES');
    var tables = [];
    for (var i = 0; i < result2.recordset.length; i++) {
      if (result2.recordset[i].TABLE_NAME != 'bitacora') {
        tables.push(result2.recordset[i].TABLE_NAME);
      }
    }
    console.log('TABLAS DESPUES DE CREAR LA TABLA: ', tables);
    res.send(tables);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
);
app.post('/makeTriggers', async (req, res) => {
  console.log('entro a makeTriggers');
  //retornar las tablas
  const result = await mssql.query`SELECT name FROM sys.tables`;
  //guardar las tablas en un array
  var tables = [];
  result.recordset.forEach((table) => {
    tables.push(table.name);
  });
  //revisar si existe un trigger insert, update, delete en cada tabla
  for (var i = 0; i < tables.length; i++) {
    var trigger = await mssql.query`SELECT * FROM sys.triggers WHERE parent_id = OBJECT_ID(${tables[i]})`;
    if (trigger.recordset.length != 0) {
      var palabra = trigger.recordset[0].name;
    } else {
      var palabra = 'undefined';
    }
    //si no existe un trigger insert, update, delete en cada tabla se crea
    if (palabra == 'undefined' && tables[i] != 'bitacora') {
      //agregar los atributos de la tabla
      var atributos = await mssql.query`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ${tables[i]}`;
      //tomar el campo field de cada atributo
      var campos = [];
      var campos2 = [];
      var campos3 = [];
      var campos4 = [];
      atributos.recordset.forEach((atributo) => {
        campos.push(atributo.COLUMN_NAME);
        campos2.push(atributo.COLUMN_NAME + ',\',\'');
        campos3.push('i.' + atributo.COLUMN_NAME + ',\',\'');
        campos4.push('d.' + atributo.COLUMN_NAME + ',\',\'');
      });
      campos = campos.toString();
      campos2 = campos2.toString();
      //quitar la ultima coma
      campos2 = campos2.substring(0, campos2.length - 4);
      campos3 = campos3.toString();
      campos4 = campos4.toString();
      campos3 = campos3.substring(0, campos3.length - 4);
      campos4 = campos4.substring(0, campos4.length - 4);

      //crear el trigger insert
      var query = `CREATE OR ALTER TRIGGER trigger_${tables[i]}_insert ON ${tables[i]} AFTER INSERT NOT FOR REPLICATION AS
      INSERT INTO bitacora (evento, inicio_sesion, usuario, aplicacion, hostname, tabla, atributos, newDatos, oldDatos) SELECT 'I', SUSER_NAME(), USER_NAME(),
      APP_NAME(), HOST_NAME(), '${tables[i]}', '${campos}', CONCAT(${campos2}), NULL FROM inserted PRINT 'Se inserto un registro en la tabla ${tables[i]}';`;

      var triggerInsert = await mssql.query(query);
      console.log('se creo el trigger insert');

      //crear el trigger update
      var queryUpdate = `CREATE OR ALTER TRIGGER trigger_${tables[i]}_update ON ${tables[i]} AFTER UPDATE NOT FOR REPLICATION AS
      INSERT INTO bitacora (evento, inicio_sesion, usuario, aplicacion, hostname, tabla, atributos, newDatos, oldDatos) SELECT 'U', SUSER_NAME(), USER_NAME(),
      APP_NAME(), HOST_NAME(), '${tables[i]}', '${campos}', CONCAT(${campos3}), CONCAT(${campos4}) FROM inserted i INNER JOIN deleted d ON i.id = d.id; PRINT 'Se actualizo un registro en la tabla ${tables[i]}';`;

      var triggerUpdate = await mssql.query(queryUpdate);
      console.log('se creo el trigger update');

      //crear el trigger delete
      var queryDelete = `CREATE OR ALTER TRIGGER trigger_${tables[i]}_delete ON ${tables[i]} AFTER DELETE NOT FOR REPLICATION AS
      INSERT INTO bitacora (evento, inicio_sesion, usuario, aplicacion, hostname, tabla, atributos, newDatos, oldDatos) SELECT 'D', SUSER_NAME(), USER_NAME(),
      APP_NAME(), HOST_NAME(), '${tables[i]}', '${campos}', NULL, CONCAT(${campos2}) FROM deleted; PRINT 'Se elimino un registro en la tabla ${tables[i]}';`;

      var triggerDelete = await mssql.query(queryDelete);
      console.log('se creo el trigger delete');


    }
  }





});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


function convertCreateTable(createTableMariaDB, nombreTabla, reference, referenceID) {
  console.log('========================================ENTRO A LA FUNCION CREATE TABLE=====================================================');
  console.log('este es el createTableMariaDB: ', createTableMariaDB);

  const columns = createTableMariaDB.map((column) => {
    const columnName = column.Field;
    const dataType = column.Type;
    const isNull = column.Null === 'YES';
    const isPK = column.Key === 'PRI';
    const isFK = column.Key === 'MUL';
    const isUnique = column.Key === 'UNI';
    const isAutoIncrement = column.Extra === 'auto_increment';
    const defaultValue = column.Default;

    let query = `${columnName} `;
    if (dataType.includes('int')) {
      query += 'INT';
    } else if (dataType.includes('double')) {
      query += 'FLOAT';
    } else {
      query += dataType;
    }

    if (!isNull) {
      query += ' NOT NULL';
    }
    if (isPK) {
      query += isAutoIncrement ? ' IDENTITY(1,1) PRIMARY KEY' : ' PRIMARY KEY';
    }
    if (isFK) {
      query += ',FOREIGN KEY(' + columnName + ') REFERENCES ' + reference + '(' + referenceID + ')';
    }
    if (isUnique) {
      query += ' UNIQUE';
    }
    if (defaultValue !== null) {
      query += ` DEFAULT ${defaultValue}`;
    }
    return query;
  });

  const query = `CREATE TABLE ${nombreTabla} (\n${columns.join(',\n')}\n);`;
  console.log('este es el query: ', query);
  return query;
}





function convertInsertQuery(queryInsert, tableName, referenceID) {
  if (queryInsert.length === 0) {
    return 'undefined';
  }

  console.log('========================================ENTRO A LA FUNCION INSERT QUERY=====================================================');
  console.log('este es el queryInsert: ', queryInsert);

  // Obtener la lista completa de columnas
  const allColumns = Object.keys(queryInsert[0]);

  // Filtrar las columnas que no son IDENTITY
  const nonIdentityColumns = allColumns.filter(column => column !== referenceID);

  // Construir la consulta de inserción SQL
  const sqlInsert = `INSERT INTO ${tableName} (${nonIdentityColumns.join(', ')}) VALUES 
    ${queryInsert.map(row => `(${nonIdentityColumns.map(col => {
    const value = row[col];
    return value === null ? 'NULL' : (typeof value === 'string' ? `'${value}'` : value);
  }).join(', ')})`).join(',\n  ')}`;

  console.log('este es el sqlInsert: ', sqlInsert);
  return sqlInsert;
}

