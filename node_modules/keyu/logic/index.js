/** @module logic **/
const { curry } = require('../fp');

/** Will evaluate the first function, if it throws any exception will evaluate the second one.
 * @argument {Function} mainFn  function to be executed.
 * @argument {Function|*} failOver function or value to fail over if first one fails.
 * @returns {Function} excepting to receive fn arguments.
 * @example
 * const jsonOr = either(parse.JSON,value => `Cannot parse ${value} as json`)
 * jsonOr(null) // -> "Cannot parse null as json"
 * @example
 * const jsonOr = either(parse.JSON,33)
 * jsonOr(null) // -> 33
 * jsonOr('{"a":1}') // -> {a:1}
 * @method
 */
const either = (mainFn, failOver) => (...arg) => {
  try {
    return mainFn(...arg);
  } catch (e) {
    return fnOrValue(failOver, e);
  }
};
/** Given a value that can be a function if it's a function we call it passing the data to it
 * if not we just return it
 * @argument {Function|*} fnOrVal a function or any value
 * @arugment {*} data any kind of data
 * @example
 * fnOrValue(3,4) // -> 3
 * fnOrValue(4,null) // -> 4
 * fnOrValue(x => x+1,4) // -> 5
 * fnOrValue(x => x*2,4) // -> 8
 * @returns {*}
 * @method
 */
const fnOrValue = curry((fnOrVal, data) => (typeof fnOrVal === 'function' ? fnOrVal(data) : fnOrVal));
/** Function that returns the passed value
 * @argument {*} x any value
 * @returns {*} any value
 * @example
 * [1,2].map(identity) // -> [1,2]
 * @method
 */
const identity = x => x;
/** Function that negates any passed function value
 * @argument {Function} fn function to be negated
 * @returns {Boolean} negated boolean value
 * @example
 * const isNumber = not(isNaN)
 * isNumber(33) // -> true
 * @method
 */
const not = fn => (...args) => !fn(...args);

module.exports = { either, fnOrValue, identity, not };
