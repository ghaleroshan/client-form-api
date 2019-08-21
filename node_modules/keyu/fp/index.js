/** @module fp **/

/** Reducer function used by `pipe` and `compose` functions to compose sync and async functions
 * @argument {function|Promise} chain a chain of functions or promises
 * @argument {function|Promise} func a new function or promise to add to the chain
 * @method
 */
const mixCompose = (chain, func) => (chain instanceof Promise || typeof chain.then === 'function' ? chain.then(func) : func(chain));

/** Compose regular functions or promises generating a final function.
 * - Compose works from left to right.
 * - If you compose one single promise the final result will be a promise too.
 * - You can only compose functions with the same arity.
 * @argument {function|Promise} arguments N number of functions or promises.
 * @returns {function|Promise} function or Promise that execute the all composed ones.
 * @example
 * const sum3 = a => a+3
 * const mult2 = a => a*2
 * const sum2Async = a => Promise.resolve(a+2) // Simulate async response
 *
 * const sumAndMult = pipe(sum3,mult2);
 * sumAndMult(1) // -> (1+3)*2 = 8
 *
 * const sumAndMultAsync = pipe(sum3,mult2,sum2Async);
 * await sumAndMultAsync(1) // -> ((1+3)*2)+2 = 10
 * @method
 */
const pipe = (...fn) => input => fn.reduce(mixCompose, input);

/** Compose regular functions or promises generating a final function.
 * - Compose works from right to left.
 * - If you compose one single promise the final result will be a promise too.
 * - You can only compose functions with the same arity.
 * @argument {function|Promise} arguments N number of functions or promises.
 * @returns {function|Promise} function or Promise that execute the all composed ones.
 * @example
 * const sum3 = a => a+3
 * const mult2 = a => a*2
 * const sum2Async = a => Promise.resolve(a+2) // Simulate async response
 *
 * const sumAndMult = compose(sum3,mult2);
 * sumAndMult(1) // -> (1*2)+3 = 5
 *
 * const sumAndMultAsync = compose(sum3,mult2,sum2Async);
 * await sumAndMultAsync(1) // -> ((1+2)*2)+3 = 9
 * @method
 */
const compose = (...fn) => input => fn.reduceRight(mixCompose, input);

/** Currify any function allowing the partial application of its arguments
 * @argument {function} function function with at least two arguments
 * @returns {function} curried function.
 * @example
 * const sum = curry((a,b) = a+b);
 * const sum3 = sum(3);
 * sum3(3) // -> 6
 * sum(3,3) // -> 6
 * sum(3)(3) // -> 6
 * @method
 */
const curry = f => {
  if (typeof f !== 'function') {
    throw new Error(`curry requires a function, [${typeof f}] passed`);
  }
  return function currify(...arg) {
    const args = Array.prototype.slice.call(arg);
    return args.length >= f.length ? f(...args) : currify.bind(null, ...args);
  };
};
module.exports = { pipe, compose, curry };
