const config = require("./config");
const _ = require("lodash");
const Joi = require("joi");
const { joiValidate, httpError } = require("./utils");

/**
 * Get all clients
 *
 * @param {*} params
 * Example curl:
 * curl -i -H "Accept: application/json"
 * -H "Content-Type: application/json"
 * -X GET http://localhost:9090/api/clients
 */

async function getMultiple(page) {
    let offset = (page - 1) * [config.itemsPerPage];

    let clients = await db.query(
        `SELECT c.id, c.first_name, c.last_name, c.phone, c.email, c.password from clients LIMIT ${offset}, ${config.itemsPerPage}`
    );
    if (!clients.length) {
        return [];
    }
    console.log(`Found ${clients.length} clients in the db`);
    return ;
}

/**
 * Get single clients by id
 *
 * @param {*} params
 * Example curl:
 * curl -i -H "Accept: application/json"
 * -H "Content-Type: application/json"
 * -X GET http://localhost:9090/api/clients/2
 */

async function get(id) {
    let client = await db.query(
        `SELECT e.id, e.first_name, e.last_name, e.phone, e.email, e.password, er.role, er.description
    FROM client e LEFT JOIN client_role er on e.fk_client_role = er.id where e.id = ?`,
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
        first_name: Joi.string()
            .min(2)
            .max(255)
            .required()
            .error(new Error("First name is required")),
        middle_name: Joi.string()
            .allow("")
            .error(new Error("middle name can only be a string")),
        last_name: Joi.string()
            .min(2)
            .max(255)
            .required()
            .error(new Error("Last name is required")),
        phone: Joi.number()
            .integer()
            .required()
            .error(new Error("Phone number is required")),
        position: Joi.string()
            .min(2)
            .max(250)
            .required()
            .error(new Error("Valid position is required")),
        email: Joi.string()
            .email({ minDomainAtoms: 2 })
            .error(new Error("Valid email address is required")),
        password: Joi.string()
            .min(5)
            .regex(/^[a-zA-Z0-9]{3,30}$/)
            .error(new Error("Password should be at least 5 character")),
        role_id: Joi.number()
            .positive()
            .required()
            .error(new Error("Category id is required as an positive number"))
    };
}

/** Create clients
 * Example curl:
 * curl -i -XPOST http://localhost:9090/api/clients \
 * -H 'content-type: application/json;charset=UTF-8' \
 * -H 'accept: application/json' \
 * --data-binary  '{"first_name": "Mark", "middle_name":"", "last_name": "Hamilton", "phone":"0411018726", "email":"markhamil@gmail.com", "password":"", "role_id":1 }'
 * @param client
 */

async function create(client) {
    joiValidate(
        client,
        Joi.object(getclientCreateValidateRules()).required()
    );

    try {
        let res = await db.query(
            `INSERT INTO client (first_name, middle_name, last_name, phone, position, email, password, fk_client_role)
      VALUES (?,?,?,?,?,?,?,?)`,
            [
                client.first_name,
                client.middle_name,
                client.last_name,
                client.phone,
                client.position,
                client.email,
                client.password,
                client.role_id
            ]
        );
        console.log(
            `Created client ${client.first_name} with id ${res.insertId}`
        );
        return {
            message: `client ${client.first_name} with id ${
                res.insertId
            } created successfully`
        };
    } catch (err) {
        const message = "Error while creating client";
        logger.error(`${message}: ${err.message}`, err);
        throw httpError(message, 500);
    }
}

/**
 * Update clients
 *
 *
 * sample curl:
 * curl -ik -XPUT http://localhost:9090/api/clients/2
 * -H 'content-type: application/json;charset=UTF-8' \
 * -H 'accept: application/json'
 * --data-binary  '{"first_name": "Mark", "middle_name" : " ", "last_name": "Hamilton", "phone": 04110718726, "position":"Manager", "email": "markhamil@gmail.com, "password":"mark123", "role_id":1 }'
 * @param client
 */

async function update(id, client) {
    client = Object.assign(id, client);
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

    joiValidate(client, Joi.object(validationRules).required());
    try {
        let res = await db.query(
            `UPDATE client SET first_name = ?, middle_name = ?, last_name = ?, phone = ?, position = ?, email = ?, fk_client_role = ? 
        WHERE id = ?`,
            [
                client.first_name,
                client.middle_name,
                client.last_name,
                client.phone,
                client.position,
                client.email,
                client.role_id,
                client.id
            ]
        );
        console.log(
            `Updated ${res.affectedRows} row(s) for client with id ${client.id}`
        );

        return {
            message: `client ${client.first_name} with id ${
                client.id
            } updated successfully`
        };
    } catch (err) {
        const message = "Error while updating client";
        logger.error(`${message}: ${err.message}`, err);
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
 * curl -ik -XPOST http://localhost:9090/api/clients/ \
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
        await db.query(`DELETE FROM client where (id) IN (?)`, [clientIds]);
        console.log("client(s) of id: " + clientIds + " deleted successfully.");

        return {
            message: "client(s) deleted successfully"
        };
    } catch (err) {
        const message = "Error while deleting client(s)";
        logger.error(`${message}: ${err.message}`, err);
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
