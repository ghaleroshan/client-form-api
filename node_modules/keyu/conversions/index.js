/** @module conversions */
const { either, fnOrValue } = require('../logic');
const { curry } = require('../fp');
const { isNumber, isObject } = require('../types');

/** Generic function. Parses a value using a parser function, then
 * evaluates the result with an evaluator function. <sup>(curried)</sup>
 *
 * If the parser throws any exception or the evaluator fails the default value is returned.
 * @argument {function} parser parse function to transform the data input
 * @argument {function} evaluator evaluates the output of the parser
 * @argument {*} defaultValue value/function to be returned/executed if it fails
 * @argument {*} data any kind of data that we want to parse
 * @example
 * jsonOr = parseOr(JSON.parse,isObject);
 * jsonOr(0,{}) // -> {}
 * jsonOr(0,null) // -> 0
 * @see [conversionsTest.js](https://github.com/nerac/keyu/blob/master/test/conversionsTest.js)
 * @see [Curring](https://en.wikipedia.org/wiki/Currying)
 * @returns {*} parsed value or default one
 * @method
 */
const parseOr = curry((parser, evaluator, defaultValue, idata) =>
  either(data => {
    const res = parser(data);
    return typeof evaluator === 'function' && evaluator(res) ? res : fnOrValue(defaultValue, data);
  }, defaultValue)(idata)
);

/** Converts passed data into a JSON or returns the default value on failure. <sup>(curried)</sup>
 * @argument {Object|Function} defaultValue default value or function to be returned if it fails.
 * @argument {*} data any kind of data that we want to parse as JSON
 * @example
 * jsonOr(-1,"sfdjl") // -> -1
 * jsonOr(() => throw Errot("Ups!"),"sfdjl") // -> Error: Ups!
 * jsonOr(-1)('{"a":1}') // -> {a:1}
 * @see [Curring](https://en.wikipedia.org/wiki/Currying)
 * @see [conversionsTest.js](https://github.com/nerac/keyu/blob/master/test/conversionsTest.js)
 * @returns {Object|*} Parsed value or the default one.
 * @method
 */
const jsonOr = parseOr(JSON.parse, isObject);
/** Converts passed data to float or returns the default value on failure. <sup>(curried)</sup>
 * @argument {Object|Function} defaultValue default value or function to be returned if it fails.
 * @argument {*} data any kind of data that we want to parse as float
 * @example
 * floatOr(-1,"x33x") // -> -1
 * floatOr(() => throw Errot("Ups!"),"x33x") // -> Error: Ups!
 * floatOr(-1)('45.553') // -> 45.553
 * @see [Curring](https://en.wikipedia.org/wiki/Currying)
 * @see [conversionsTest.js](https://github.com/nerac/keyu/blob/master/test/conversionsTest.js)
 * @returns {Float|*} Parsed value or the default one.
 * @method
 */
const floatOr = parseOr(parseFloat, isNumber);
/** Converts passed data to int or returns the default value on failure. <sup>(curried)</sup>
 * @argument {Object|Function} defaultValue default value or function to be returned if it fails.
 * @argument {*} data any kind of data that we want to parse as int
 * @example
 * intOr(-1,"x33x") // -> -1
 * intOr(() => throw Error("Ups!"),"x33x") // -> Error: Ups!
 * intOr(-1)('45.553') // -> 45
 * @see [Currying](https://en.wikipedia.org/wiki/Currying)
 * @see [conversionsTest.js](https://github.com/nerac/keyu/blob/master/test/conversionsTest.js)
 * @returns {Int|*} Parsed value or the default one.
 * @method
 */
const intOr = parseOr(num => (typeof num === 'number' ? num - (num % 1) : parseInt(`${num}`, 10)), isNumber);

/** Fixes the number of decimals of a float.
 * Returns the default value if non numeric value passed.<sup>(curried)</sup>
 * @argument {Int} decimals number of decimals to fix.
 * @argument {Function|*} defaultValue value to be returned if non number received
 * @argument {Float} num float number that we want to fix it's decimals.
 * @example
 * setPrecisionOr(1,"fail", 3.44) // -> 3.4
 * setPrecisionOr(1,"fail", null) // -> "fail"
 * setPrecisionOr(0,"fail", 3.44) // -> 3
 * @see [Curring](https://en.wikipedia.org/wiki/Currying)
 * @see [conversionsTest.js](https://github.com/nerac/keyu/blob/master/test/conversionsTest.js)
 * @returns {Float}
 * @method
 */
const setPrecisionOr = curry((decimals, defaultValue, num) => (isNumber(num) ? Number(num.toFixed(decimals)) : fnOrValue(defaultValue, num)));

module.exports = { parseOr, jsonOr, floatOr, intOr, setPrecisionOr };
