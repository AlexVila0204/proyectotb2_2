import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { Table } from "react-bootstrap";
export const MainMenu = () => {


    const [deps, setDeps] = useState([]);
    const [deps2, setDeps2] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnectedMariaDB, setIsConnectedMariaDB] = useState(false);
    const [portused, setPort] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRowValue, setSelectedRowValue] = useState('');
    const [orderdeps, setOrderdeps] = useState([]);
    const handleRowClick = (event) => {
        const clickedRow = event.currentTarget;
        const rowIndex = parseInt(clickedRow.getAttribute('data-row-index'));
        const rowValue = clickedRow.querySelector('td').innerText;
        if (selectedRow !== null) {
            const prevSelectedRow = document.querySelector(`tr[data-row-index="${selectedRow}"]`);
            prevSelectedRow.classList.remove('selected');

        }
        setSelectedRowValue(rowValue);
        clickedRow.classList.add('selected');
        setSelectedRow(rowIndex);
    };

    const handleCancel = async () => {
        setOrderdeps([]);
    };
    const handleTestConnMariaDB = async () => {
        setOrderdeps([]);
        const nameInstance = document.getElementById('DestinyDBnameInstance').value;
        const dbName = document.getElementById('DestinyDBname').value;
        const port = document.getElementById('DestinyDBPort').value;
        const user = document.getElementById('DestinyDBUser').value;
        const password = document.getElementById('DestinyDBpassword').value;
        setPort(port);
        if (port === "1433") {
            axios.post('http://localhost:4080/startServer', {
                nameInstance: nameInstance,
                dbName: dbName,
                user: user,
                password: password
            })
                .then(function (response) {
                    // Handle success
                    console.log(response.data);
                    setDeps2(response.data);
                    console.log('Se ha conectado a SQLSERVER');
                    setIsConnectedMariaDB(true);
                })
                .catch(function (error) {
                    // Handle error
                    console.log(error);
                    alert(error);
                    console.log('No se ha conectado a SQLSERVER');
                    setIsConnectedMariaDB(false);
                })
                .then(function () {
                    // Always executed
                });
        } else {
            // Send a POST request to the server SQL Server
            axios.post('http://localhost:4070/startServer', {
                nameInstance: nameInstance,
                dbName: dbName,
                user: user,
                port: port,
                password: password
            })
                .then(function (response) {
                    // Handle success
                    console.log(response.data);
                    alert(response.data);
                    console.log('Se ha conectado a MARIADB');
                    setIsConnectedMariaDB(true);
                })
                .catch(function (error) {
                    // Handle error
                    console.log(error);
                    console.log('No se ha conectado a MARIADB');
                    setIsConnectedMariaDB(false);
                    alert(error);
                })
                .then(function () {
                    // Always executed
                });

        }
    };
    //Conectar base de ORIGEN
    const handleTestConnection = async () => {
        setOrderdeps([]);
        const nameInstance = document.getElementById('OriginDBnameInstance').value;
        const dbName = document.getElementById('OriginDBname').value;
        const user = document.getElementById('OriginDBUser').value;
        const port = document.getElementById('OriginDBPort').value;
        const password = document.getElementById('OriginDBpassword').value;
        setPort(port);
        if (port === "1433") {
            // Send a POST request to the server SQL Server
            axios.post('http://localhost:4080/startServer', {
                nameInstance: nameInstance,
                dbName: dbName,
                user: user,
                password: password
            })
                .then(function (response) {
                    // Handle success
                    console.log('Conexion Exitosa');
                    alert('Conexion Exitosa');
                    setIsConnected(true);
                })
                .catch(function (error) {
                    // Handle error
                    console.log(error);
                    setIsConnected(false);
                    alert(error);
                })
                .then(function () {
                    // Always executed
                });
        } else {
            // Send a POST request to the server SQL Server mariaDB
            axios.post('http://localhost:4070/startServer', {
                nameInstance: nameInstance,
                dbName: dbName,
                port: port,
                user: user,
                password: password
            })
                .then(function (response) {
                    // Handle success
                    setDeps(response.data);
                    console.log('Conexion Exitosa');
                    alert('Conexion Exitosa');
                    console.log('Se ha conectado a MARIADB');
                    setIsConnected(true);


                })
                .catch(function (error) {
                    // Handle error
                    console.log(error);
                    alert(error);
                    console.log('No se ha conectado a MARIADB');
                    setIsConnected(false);
                })
                .then(function () {
                    // Always executed
                });

        }
    };
    //Desconectar base de datos Origen
    const handleDisconnect = async () => {
        const port = document.getElementById('OriginDBPort').value;
        setPort(port);
        //print port 
        console.log(port);
        if (portused === '1433') {
            axios.post('http://localhost:4080/disconnectConection')
                .then(function (response) {
                    // Handle success
                    console.log('Esto Deberia Pasar');
                    console.log(response.data);
                    alert(response.data);
                    setIsConnected(false);
                })
                .catch(function (error) {
                    // Handle error
                    console.log(error);
                    alert(error);
                    setIsConnected(true);
                })
                .then(function () {
                    // Always executed
                });
        } else if (portused === '3306') {
            setIsConnected(false);
        }
    };

    //Desconectar base de datos Destino
    const handleDisconnectDestiny = async () => {
        const port = document.getElementById('DestinyDBPort').value;
        setPort(port);
        if (portused === "1433") {
            axios.post('http://localhost:4080/disconnectConection')
                .then(function (response) {
                    // Handle success
                    console.log(response.data);
                    alert(response.data);
                    setIsConnectedMariaDB(false);
                })
                .catch(function (error) {
                    // Handle error
                    console.log(error);
                    alert(error);
                    setIsConnectedMariaDB(true);
                })
                .then(function () {
                    // Always executed
                });
        } else if (portused === "3306") {
            setIsConnectedMariaDB(false);
        }
    };
    const handleDeleteTables = async () => {
        setOrderdeps([]);
        try {
            const tableName = selectedRowValue;
            setPort("1433");
            const response = await axios.post('http://localhost:4080/deleteTable', {
                tableName: tableName
            });

            // Handle success
            if (response.data === "La tabla no existe") {
                alert('La tabla tiene constraint debe eliminar otra primero');
            } else {
                setDeps2(response.data);
                console.log('Se ha eliminado la tabla en SQLSERVER');
            }
        } catch (error) {
            console.error(error);
            alert(error);
        }


    };
    const handleMakeTriggers = async () => {
        const nameInstance = document.getElementById('OriginDBnameInstance').value;
        const dbName = document.getElementById('OriginDBname').value;
        const user = document.getElementById('OriginDBUser').value;
        const port = document.getElementById('OriginDBPort').value;
        const password = document.getElementById('OriginDBpassword').value;
        setPort(port);
        if (port === "1433") {
            // Send a POST request to the server SQL Server
            axios.post('http://localhost:4080/makeTriggers', {
                nameInstance: nameInstance,
                dbName: dbName,
                user: user,
                password: password
            })
                .then(function (response) {
                    // Handle success
                    console.log(response.data);
                    alert(response.data);
                })
                .catch(function (error) {
                    // Handle error
                    console.log(error);
                    alert(error);
                })
                .then(function () {
                    // Always executed
                });
        } else if (port === "3306") {
            // Send a POST request to the server SQL Server mariaDB
            axios.post('http://localhost:4070/makeTriggers', {
                nameInstance: nameInstance,
                dbName: dbName,
                port: port,
                user: user,
                password: password
            })
                .then(function (response) {
                    // Handle success
                    alert("Se han creado los triggers")
                    console.log(response.data);
                })
                .catch(function (error) {
                    // Handle error
                    console.log(error);
                    alert(error);
                })
                .then(function () {
                    // Always executed
                });

        }
    };

    //obtener el nombre del valor seleccionado en la tabla
    const handleSelectedRow = async () => {
        try {
            const nameInstance = document.getElementById('OriginDBnameInstance').value;
            const dbName = document.getElementById('OriginDBname').value;
            const user = document.getElementById('OriginDBUser').value;
            const port = document.getElementById('OriginDBPort').value;
            const password = document.getElementById('OriginDBpassword').value;
            const tableName = selectedRowValue;
            var estructuraTabla = [];
            console.log(tableName);
            setPort(port);

            if (port === "1433") {
                // Send a POST request to the server SQL Server
                const response = await axios.post('http://localhost:4080/makeTriggers', {
                    nameInstance: nameInstance,
                    dbName: dbName,
                    user: user,
                    password: password
                });

                // Handle success
                console.log(response.data);
                alert(response.data);
            } else if (port === "3306") {
                if (deps2.length === deps.length) {
                    const response = await axios.post('http://localhost:4080/deleteTableSecret', {
                        nombreTabla: tableName,
                        nombresTablas: deps
                    });
                    alert('Hay modificaciones ');
                    console.log(response.data);
                    for (var i = 0; i < orderdeps.length; i++) {
                        const response = await axios.post('http://localhost:4070/getTablas', {
                            nameInstance: nameInstance,
                            dbName: dbName,
                            port: port,
                            user: user,
                            password: password,
                            tableName: orderdeps[i]
                        });

                        // Handle success
                        estructuraTabla = response.data;
                        console.log(estructuraTabla);

                        const response2 = await axios.post('http://localhost:4080/createTable2', {
                            QueryTabla: estructuraTabla[0],
                            nombreTabla: orderdeps[i],
                            queryInsert: estructuraTabla[1],
                            constraint: estructuraTabla[2],
                            referenceID: estructuraTabla[3],
                            nombresTablas: deps
                        });

                        // Handle success
                        if (response2.data === "La tabla ya existe") {
                            console.log(response2.data);
                        } else {
                            console.log('Se ha creado la tabla en SQLSERVER');
                        }

                    }
                } else {
                    const response = await axios.post('http://localhost:4070/getTablas', {
                        nameInstance: nameInstance,
                        dbName: dbName,
                        port: port,
                        user: user,
                        password: password,
                        tableName: tableName
                    });

                    // Handle success
                    estructuraTabla = response.data;
                    console.log(estructuraTabla);

                    const response2 = await axios.post('http://localhost:4080/createTable', {
                        QueryTabla: estructuraTabla[0],
                        nombreTabla: tableName,
                        queryInsert: estructuraTabla[1],
                        constraint: estructuraTabla[2],
                        referenceID: estructuraTabla[3],
                        nombresTablas: deps
                    });

                    // Handle success
                    if (response2.data === "La tabla ya existe") {
                        console.log(response2.data);
                        alert('Hay modificaciones ');
                    } else {
                        console.log('Se ha creado la tabla en SQLSERVER');
                        alert('Se ha creado la tabla en SQLSERVER: ' + tableName);
                        setDeps2(response2.data);
                        orderdeps.push(tableName);
                    }

                }

            }
        } catch (error) {
            // Handle error
            console.error(error);
            alert(error);
        }
    };


    //chamge the color of the button if the connection is stablished
    useEffect(() => {
        if (isConnected) {
            document.getElementById('buttonOriginDB').style.backgroundColor = "green";
        } else {
            document.getElementById('buttonOriginDB').style.backgroundColor = "red";
        }
    }, [isConnected]);

    useEffect(() => {
        if (isConnectedMariaDB) {
            document.getElementById('buttonDestinyDB').style.backgroundColor = "green";
        } else {
            document.getElementById('buttonDestinyDB').style.backgroundColor = "red";
        }
    }, [isConnectedMariaDB]);


    return (
        <div className='container'>
            <div className="MainTitle">
                <h1>Configuracion Bases de Datos</h1>
                <form className="OriginDB">
                    <lable htmlFor="OriginDB">Bases de Datos de Origen</lable>
                    <label htmlFor="OriginDB">Nombre Instancia</label>
                    <input type="text" placeholder="Nombre Instancia" id="OriginDBnameInstance" name="OriginDB" />
                    <label htmlFor="OriginDB">Nombre Base de Datos</label>
                    <input type="text" placeholder="Nombre Base de Datos Origen" id="OriginDBname" name="OriginDB" />
                    <label htmlFor="OriginDB">Puerto</label>
                    <input type="text" placeholder="Puerto de la Base de Datos Origen" id="OriginDBPort" name="OriginDB" />
                    <label htmlFor="OriginDB">Nombre Usuario</label>
                    <input type="text" placeholder="Nombre Usuario de la Base de Datos Origen" id="OriginDBUser" name="OriginDB" />
                    <label htmlFor="OriginDB">Contraseña</label>
                    <input type="text" placeholder="Contraseña de la Base de Datos Origen" id="OriginDBpassword" name="OriginDB" />
                    <button type="button" onClick={handleTestConnection} id="buttonOriginDB">Probar</button>

                </form>
                <form className="DestinyDB">
                    <lable htmlFor="DestinyDB">Bases de Datos Destino</lable>
                    <label htmlFor="DestinyDB">Nombre Instancia</label>
                    <input type="text" placeholder="Nombre Instancia" id="DestinyDBnameInstance" name="DestinyDB" />
                    <label htmlFor="DestinyDB">Nombre Base de Datos</label>
                    <input type="text" placeholder="Nombre Base de Datos Origen" id="DestinyDBname" name="DestinyDB" />
                    <label htmlFor="DestinyDB">Puerto</label>
                    <input type="text" placeholder="Puerto de la Base de Datos Origen" id="DestinyDBPort" name="DestinyDB" />
                    <label htmlFor="DestinyDB">Nombre Usuario</label>
                    <input type="text" placeholder="Nombre Usuario de la Base de Datos Origen" id="DestinyDBUser" name="DestinyDB" />
                    <label htmlFor="DestinyDB">Contraseña</label>
                    <input type="text" placeholder="Contraseña de la Base de Datos Origen" id="DestinyDBpassword" name="DestinyDB" />
                    <button type="button" id="buttonDestinyDB" onClick={handleTestConnMariaDB}>Probar</button>
                </form>
                <div className="TablesBDOrigin">
                    <h2>Tablas Base de Datos Origen</h2>
                    <label className="labelDBorgin1">Sin Replicar</label>
                    <div className="divTable">
                        <Table className="tableDBorigin" striped bordered hover>

                            <thead>
                                <tr>
                                    <th>Nombre Tabla Origen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deps.map((row, index) => (
                                    <tr key={index} onClick={(e) => handleRowClick(e)} data-row-index={index} className={selectedRow === index ? 'selected' : ''}>
                                        <td>{row}</td>
                                    </tr>
                                ))}
                            </tbody>

                        </Table>
                    </div>

                    <button className="buttonSinReplicar" type="button" onClick={handleSelectedRow}> <br />
                        &gt;&gt; </button>
                    <label className="labelDBDestiny">Replicar</label>
                    <div className="divTable2">
                        <Table className="tableDBDestiny" striped bordered hover>

                            <thead>
                                <tr>
                                    <th>Nombre Tabla Destino</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deps2.map((row, index) => (
                                    <tr key={index} onClick={(e) => handleRowClick(e)} data-row-index={index} className={selectedRow === index ? 'selected' : ''}>
                                        <td>{row}</td>
                                    </tr>
                                ))}

                            </tbody>

                        </Table>
                    </div>
                    <button className="buttonReplicar" type="button" onClick={handleDeleteTables}>  <br />
                        &lt;&lt; </button>
                    <button className="buttonSave" type="button">Guardar</button>
                    <button className="buttonCancel" type="button" onClick={handleCancel}>Cancelar</button>

                </div>

                <button className="buttonDisconnect" type="button" onClick={handleDisconnect}>Desconectar Origen</button>
                <button className="buttonDisconnectDestiny" type="button" onClick={handleDisconnectDestiny}>Desconectar Destino</button>
                <button className="buttonRefresh" type="button" onClick={handleMakeTriggers}>Refrescar</button>


            </div>

        </div>



    )

};




