const Joi = require("joi");
const _ = require("lodash");

/**
 * It will add index if schema is object or array.
 * It will append 2nd index like images0 if 2nd message in array path is numeric.
 */
function joiValidate(params, schema, errors = []) {
    if (!schema.isJoi) {
        throw new Error("Schema has to be a Joi object");
    }

    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: { objects: true }
    };
    const { error, value } = Joi.validate(params, schema, options);

    if (error) {
        if (
            ["array", "object"].includes(schema._type) &&
            _.get(error, "details[0].path", "").includes(".")
        ) {
            errors.push(
                error.details.map(({ message, path }) => {
                    const paths = path.split(".");
                    const index = paths[0].concat(
                        Number.isFinite(parseInt(paths[1])) ? _.get(paths, "1", "") : ""
                    );

                    return `${message} at index ${index}`;
                })
            );
        } else {
            errors.push(error.message);
        }
        throw httpError(`Error: (${errors})`, 400);
    }

    return value;
}

function httpError(message, code) {
    const err = new Error(`${message}`);
    err.statusCode = code || 500;
    return err;
}

module.exports = {
    httpError,
    joiValidate
};
