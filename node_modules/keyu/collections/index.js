/** @module collections */
const { curry } = require('../fp');

/** Reduces an array/object based on the reduction function
 * and the initialization value passed
 * @argument {function} fn Reduce function
 * @argument {*} init Initial value to accumulate
 * @argument {Array|Object} collection iterable collection to traverse
 * @example
 * //Arrays
 * reduce((a,b)=> a+b,0,[1,2,3]) // -> 6
 * reduce((a,b)=> a.concat(b+1),[],[1,2,3]) // -> [2,3,4]
 * //Objects
 * reduce((a,v,k)=> ({..a,[k],v+1}),{},{a:1,b:2}) // -> {a:2,b:3}
 * @returns {*}
 * @see [collectionsTest.js](https://github.com/nerac/keyu/blob/master/test/collectionsTest.js)
 * @method
 * */
const reduce = curry((fn, init, collection) => {
  if (Array.isArray(collection)) {
    return collection.reduce(fn, init);
  }
  return Object.entries(collection).reduce((acc, [k, v]) => fn(acc, v, k), init);
});

/** Maps over an array/object applying the passed function
 * @argument {function} fn Reduce function
 * @argument {Array|Object} collection iterable collection to traverse
 * @example
 * //Arrays
 * map(x => x+1, [1,2,3]) // -> [2,3,4]
 * //Objects
 * map(x => x+1, {a:1,b:2}) // -> {a:2,b:3}
 * @returns {Array|Object}
 * @see [collectionsTest.js](https://github.com/nerac/keyu/blob/master/test/collectionsTest.js)
 * @method
 * */
const map = curry((fn, collection) => {
  if (Array.isArray(collection)) {
    return collection.map(fn);
  }
  return reduce((acc, v, k) => ({ ...acc, [k]: fn(v, k) }), {}, collection);
});

/** Filters an array/object based on the boolean evaluation of the passed function.
 * @argument {function} fn Reduce function
 * @argument {Array|Object} collection iterable collection to traverse
 * @example
 * //Arrays
 * filter(x => x > 1, [1,2,3]) // -> [2,3]
 * //Objects
 * filter(x => x > 1, {a:1,b:2}) // -> {b:2}
 * @returns {Array|Object}
 * @see [collectionsTest.js](https://github.com/nerac/keyu/blob/master/test/collectionsTest.js)
 * @method
 * */
const filter = curry((fn, collection) => {
  if (Array.isArray(collection)) {
    return collection.filter(fn);
  }
  return reduce((acc, v, k) => (fn(v, k) && { ...acc, [k]: v }) || {}, {}, collection);
});

module.exports = { map, filter, reduce };
