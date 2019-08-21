/* global process */
/** @module io */

const { fnOrValue } = require('../logic');
/** Returns and parses an environment var and if does not exists returns the default value
 * @argument {String} key key to get from our environment variables
 * @argument {*} defaultValue default value to be returned if key not found
 * @argument {Function} postProcessor process the value once getted.
 * @argument {Object} env io source to read environment vars from
 * @returns {*}
 * @method
 */
const envOr = (key, defaultValue, postProcessor = x => x, { env } = process) => postProcessor(typeof key === 'string' && env && env[key.toUpperCase()]) || fnOrValue(defaultValue, key);

module.exports = { envOr };
