/** @module types */

/** Checks **correctly** if the passed type is or not a **number**
 * @argument {*} num any possible data type
 * @argument flag if you want strict numbers or not
 * @returns {boolean} indicating if is a number or not (the flag argument can be used to further filter strict numbers)
 * @example
 * isNumber(null) // -> false note isNaN(null) will return false instead
 * @example
 * isNumber("33", true) // -> false since the strict flag is set and "33" is not a strict number
 * @see [typesTest.js](https://github.com/nerac/keyu/blob/master/test/typesTest.js)
 * @method
 */
const isNumber = (value, strict = false) => Boolean((typeof value === 'number' && !isNaN(value)) || (!strict && !isNaN(parseFloat(value))));

/** Checks **correctly** if the passed type is or not an **object**
 * @argument {*} num any possible data type
 * @returns {boolean} indicating if it's an object or not
 * @example
 * isObject(null) // -> false note that typeof will return true
 * isObject({}) // -> true
 * isObject(new Error()) // -> true
 * @see [typesTest.js](https://github.com/nerac/keyu/blob/master/test/typesTest.js)
 * @method
 */
const isObject = obj => typeof obj === 'object' && !Array.isArray(obj) && obj !== null;

/** Checks if the passed type is a non defined value, either `undefined` or `null`
 * @argument {*} num any possible data type
 * @returns {boolean} indicating if it's an non defined
 * @example
 * isNil(null) // -> true
 * isNil(3) // -> false
 * isNil() // -> true
 * isNil(undefined) // -> true
 * @see [typesTest.js](https://github.com/nerac/keyu/blob/master/test/typesTest.js)
 * @method
 */
const isNil = value => typeof value === 'undefined' || value === null;

/** Returns the name of the function in which is called.
 * @argument {String} [defaultValue] string for unknown calls.
 * @returns {String} indicating the possible name of the function
 * @example
 * const hello = () => getFuncName()
 * hello() // -> "hello"
 * getFuncName() // -> "Unknown"
 * getFuncName("ups") // -> "ups"
 * @see [typesTest.js](https://github.com/nerac/keyu/blob/master/test/typesTest.js)
 * @method
 */
function getFuncName(defaultValue = 'Unknown') {
  return (getFuncName.caller && getFuncName.caller.name) || defaultValue;
}

module.exports = { isNumber, isObject, isNil, getFuncName };
