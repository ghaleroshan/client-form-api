const config = require("./config");
const _ = require("lodash");
const db = require("namshi-node-mysql")(config.db);
const Joi = require("joi");
const { joiValidate, httpError } = require("./utils");


/**
 * Get all clients
 *
 * @param {*} params
 * Example curl:
 * curl -i -H "Accept: application/json"
 * -H "Content-Type: application/json"
 * -X GET http://localhost:8080/api/clients
 */
async function getMultiple() {

    let clients = await db.query(
        `SELECT id, fullName, gender, age, address, phone, email FROM clients`
    );
    if (!clients.length) {
        return [];
    }
    console.log(`Found ${clients.length} clients in the db`);
    return clients;
}

/**
 * Get single clients by id
 *
 * @param {*} params
 * Example curl:
 * curl -i -H "Accept: application/json"
 * -H "Content-Type: application/json"
 * -X GET http://localhost:8080/api/clients/2
 */

async function get(id) {
    let client = await db.query(
        `SELECT id, fullName, age, gender, address FROM clients where id = ?`,
        [id]
    );
    if (!client.length) {
        return [];
    }

    console.log(`Found ${client.length} clients in the db`);
    return client;
}

function getclientCreateValidateRules() {
    return {
        fullName: Joi.string()
            .min(2)
            .max(255)
            .required()
            .error(new Error("Full name is required")),
        age: Joi.number()
            .integer()
            .required()
            .error(new Error("Age is required")),
        gender: Joi.string()
            .valid(["Male", "Female", "Others"])
            .error(new Error("Please select a gender")),
        phone: Joi.string()
            .required()
            .error(new Error("Phone number is required")),
        address: Joi.string()
            .min(5)
            .max(250)
            .required()
            .error(new Error("Address is required")),
        email: Joi.string()
            .email({ minDomainAtoms: 2 })
            .error(new Error("Valid email address is required"))
    };
}

/** Create clients
 * Example curl:
 * curl -i -XPOST http://localhost:8080/api/clients \
 * -H 'content-type: application/json;charset=UTF-8' \
 * -H 'accept: application/json' \
 * --data-binary  '{"fullName": "Roshan Ghale", "phone":"0411018726", "gender":"Male", "age": 28,"address":"Narwee", "email":"ghaler@gmail.com"}'
 * @param clients
 */

async function create(clients) {
    joiValidate(
        clients,
        Joi.object(getclientCreateValidateRules()).required()
    );

    try {
        let res = await db.query(
            `INSERT INTO clients (fullName, age, gender,  phone, email, address)
      VALUES (?,?,?,?,?,?)`,
            [
                clients.fullName,
                clients.age,
                clients.gender,
                clients.phone,
                clients.email,
                clients.address
            ]
        );
        console.log(
            `Created client ${clients.fullName} with id ${res.insertId}`
        );
        return {
            message: `client ${clients.fullName} with id ${
                res.insertId
            } created successfully`
        };
    } catch (err) {
        const message = "Error while creating client";
        console.error(`${message}: ${err.message}`, err);
        throw httpError(message, 500);
    }
}

/**
 * Update clients
 *
 *
 * sample curl:
 * curl -ik -XPUT http://localhost:8080/api/clients/2
 * -H 'content-type: application/json;charset=UTF-8' \
 * -H 'accept: application/json'
 * --data-binary  '{"fullName":"Roshan Ghale","age":26, "address":"Nepal","gender":1 "phone": 04110718726,"email": "markhamil@gmail.com}'
 * @param clients
 */

async function update(id, clients) {
   clients = Object.assign(id, clients);
    const validationRules = Object.assign(
        {
            id: Joi.number()
                .integer()
                .positive()
                .min(1)
                .required()
                .error(new Error("Id is required as an integer"))
        },
        getclientCreateValidateRules()
    );

    joiValidate(clients, Joi.object(validationRules).required());
    try {
        let res = await db.query(
            `UPDATE clients SET fullName = ?, age = ?, gender = ?, phone = ?,  email = ?, address = ?
        WHERE id = ?`,
            [
                clients.fullName,
                clients.age,
                clients.gender,
                clients.phone,
                clients.address,
                clients.email,
                clients.id
            ]
        );
        console.log(
            `Updated ${res.fullName} for client with id ${clients.id}`
        );

        return {
            message: `client ${clients.fullName} with id ${
                clients.id
            } updated successfully`
        };
    } catch (err) {
        const message = "Error while updating client";
        console.error(`${message}: ${err.message}`, err);
        throw httpError(message, 500);
    }
}

/**
 * Delete multiple clients
 *
 * 'delete' is javascript reserved word so 'remove' is used as function name.
 *
 * @param {*} ids
 *
 * sample curl:
 * curl -ik -XPOST http://localhost:8080/api/clients/ \
 * -H 'content-type: application/json;charset=UTF-8' \
 * -H 'accept: application/json'
 * --data-binary  '{"clientIds": [6,10,14]}'
 *
 * Generic error message is added which is covered by test.
 */

async function remove(clientIds) {
    const schema = {
        clientIds: Joi.array()
            .items(
                Joi.number()
                    .integer()
                    .required()
            )
            .error(new Error("Id is required as an array of integer(s)"))
    };
    joiValidate({ clientIds: clientIds }, Joi.object(schema).required());
    try {
        await db.query(`DELETE FROM clients where id = ?`, [clientIds]);
        console.log("client(s) of id: " + clientIds + " deleted successfully.");

        return {
            message: "client(s) deleted successfully"
        };
    } catch (err) {
        const message = "Error while deleting client(s)";
        console.error(`${message}: ${err.message}`, err);
        throw httpError(message, 500);
    }
}

module.exports = {
    getMultiple,
    get,
    update,
    remove,
    create,
};
