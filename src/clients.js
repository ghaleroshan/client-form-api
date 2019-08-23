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

    let clientDetails = await db.query(
        `SELECT id, full_name, gender, age, address, phone, email FROM clientDetails`
    );
    if (!clientDetails.length) {
        return [];
    }
    console.log(`Found ${clientDetails.length} clientDetails in the db`);
    return clientDetails;
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
        `SELECT id, full_name, age, gender, address FROM clientDetails where id = ?`,
        [id]
    );
    if (!client.length) {
        return [];
    }

    console.log(`Found ${client.length} clientDetails in the db`);
    return client;
}

function getclientCreateValidateRules() {
    return {
        full_name: Joi.string()
            .min(2)
            .max(255)
            .required()
            .error(new Error("Full name is required")),
        phone: Joi.string()
            .required()
            .error(new Error("Phone number is required")),
        age: Joi.number()
            .integer()
            .required()
            .error(new Error("Age is required")),
        gender: Joi.number()
            .min(0)
            .max(2)
            .required(),
        address: Joi.string()
            .min(5)
            .max(250)
            .required()
            .error(new Error("Address is required")),
        email: Joi.string()
            .email({ minDomainAtoms: 2 })
            .error(new Error("Valid email address is required")),
    };
}

/** Create clientDetails
 * Example curl:
 * curl -i -XPOST http://localhost:8080/api/clientDetails \
 * -H 'content-type: application/json;charset=UTF-8' \
 * -H 'accept: application/json' \
 * --data-binary  '{"full_name": "Roshan Ghale", "phone":"0411018726", "gender":1, "age": 28,"address":"Narwee", "email":"ghaler@gmail.com"}'
 * @param clientDetails
 */

async function create(clientDetails) {
    joiValidate(
        clientDetails,
        Joi.object(getclientCreateValidateRules()).required()
    );

    try {
        let res = await db.query(
            `INSERT INTO clientDetails (full_name, age, gender, address, phone, email)
      VALUES (?,?,?,?,?,?)`,
            [
                clientDetails.full_name,
                clientDetails.phone,
                clientDetails.age,
                clientDetails.email,
                clientDetails.gender,
                clientDetails.address
            ]
        );
        console.log(
            `Created client ${clientDetails.full_name} with id ${res.insertId}`
        );
        return {
            message: `client ${clientDetails.full_name} with id ${
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
 * --data-binary  '{"full_name":"Roshan Ghale","age":26, "address":"Nepal","gender":1 "phone": 04110718726,"email": "markhamil@gmail.com}'
 * @param clientDetails
 */

async function update(id, clientDetails) {
   clients = Object.assign(id, clientDetails);
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
            `UPDATE clientDetails SET full_name = ?, age = ?, gender = ?, phone = ?, address = ?, email = ?
        WHERE id = ?`,
            [
                clientDetails.full_name,
                clientDetails.age,
                clientDetails.gender,
                clientDetails.phone,
                clientDetails.address,
                clientDetails.email,
                clientDetails.id
            ]
        );
        console.log(
            `Updated ${res.full_name} for client with id ${clientDetails.id}`
        );

        return {
            message: `client ${clientDetails.full_name} with id ${
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
