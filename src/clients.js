const config = require("./config");
const _ = require("lodash");
const db = require("namshi-node-mysql")(config.db);
const Joi = require("joi");
const { joiValidate, httpError } = require("./utils");


/**
 * Get all clientDetails
 *
 * @param {*} params
 * Example curl:
 * curl -i -H "Accept: application/json"
 * -H "Content-Type: application/json"
 * -X GET http://localhost:8080/api/clientDetails
 */
async function getMultiple() {

    let clients = await db.query(
        `SELECT id, fullName, age, gender, phone, email, address FROM clientDetails`
    );
    if (clients.length) {
        return clients;
    }
    console.log(`Found ${clients.length} clients in the db`);
    return [];
}

/**
 * Get single clientDetails by id
 *
 * @param {*} params
 * Example curl:
 * curl -i -H "Accept: application/json"
 * -H "Content-Type: application/json"
 * -X GET http://localhost:8080/api/clientDetails/2
 */

async function get(id) {
    let client = await db.query(
        `SELECT id,fullName, age, gender, phone, email, address FROM clientDetails where id = ?`,
        [id]
    );
    if (!client.length) {
        return [];
    }

    console.log(`Found ${client.length} clientDetails in the db`);
    return client;
}

function getClientCreateValidateRules() {
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

/** Create clientDetails
 * Example curl:
 * curl -i -XPOST http://localhost:8080/api/clientDetails \
 * -H 'content-type: application/json;charset=UTF-8' \
 * -H 'accept: application/json' \
 * --data-binary  '{"fullName": "Roshan Ghale", "phone":"0411018726", "gender":"Male", "age": 28,"address":"Narwee", "email":"ghaler@gmail.com"}'
 * @param clientDetails
 */

async function create(clientDetails) {
    joiValidate(
        clientDetails,
        Joi.object(getClientCreateValidateRules()).required()
    );

    try {
        let res = await db.query(
            `INSERT INTO clientDetails (fullName, age, gender,  phone, email, address)
      VALUES (?,?,?,?,?,?)`,
            [
                clientDetails.fullName,
                clientDetails.age,
                clientDetails.gender,
                clientDetails.phone,
                clientDetails.email,
                clientDetails.address
            ]
        );
        console.log(
            `Created client ${clientDetails.fullName} with id ${res.insertId}`
        );
        return {
            message: `client ${clientDetails.fullName} with id ${
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
 * Update clientDetails
 *
 *
 * sample curl:
 * curl -ik -XPUT http://localhost:8080/api/clientDetails/2
 * -H 'content-type: application/json;charset=UTF-8' \
 * -H 'accept: application/json'
 * --data-binary  '{"fullName":"Roshan Ghale","age":26, "address":"Nepal","gender":1 "phone": 04110718726,"email": "markhamil@gmail.com}'
 * @param clientDetails
 */

async function update(id, clientDetails) {
   clientDetails = Object.assign(id, clientDetails);
    const validationRules = Object.assign(
        {
            id: Joi.number()
                .integer()
                .positive()
                .min(1)
                .required()
                .error(new Error("Id is required as an integer"))
        },
        getClientCreateValidateRules()
    );

    joiValidate(clientDetails, Joi.object(validationRules).required());
    try {
        let res = await db.query(
            `UPDATE clientDetails SET fullName = ?, age = ?, gender = ?, phone = ?,  email = ?, address = ?
        WHERE id = ?`,
            [
                clientDetails.fullName,
                clientDetails.age,
                clientDetails.gender,
                clientDetails.phone,
                clientDetails.address,
                clientDetails.email,
                clientDetails.id
            ]
        );
        console.log(
            `Updated ${res.fullName} for client with id ${clientDetails.id}`
        );

        return {
            message: `client ${clientDetails.fullName} with id ${
                clientDetails.id
            } updated successfully`
        };
    } catch (err) {
        const message = "Error while updating client";
        console.error(`${message}: ${err.message}`, err);
        throw httpError(message, 500);
    }
}

/**
 * Delete multiple clientDetails
 *
 * 'delete' is javascript reserved word so 'remove' is used as function name.
 *
 * @param {*} ids
 *
 * sample curl:
 * curl -ik -XPOST http://localhost:8080/api/clientDetails/ \
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
        await db.query(`DELETE FROM clientDetails where id = ?`, [clientIds]);
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
