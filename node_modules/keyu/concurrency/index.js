/** @module concurrency */

/**A **Promise.all** that does not fails-fast.
 * Given N promises will return all of them <u>independenly if they failed or not</u>.
 * @see [Fail-fast](https://en.wikipedia.org/wiki/Fail-fast)
 * @see [Rob-Pike](https://www.youtube.com/watch?v=f6kdp27TYZs)
 * @see [concurrencyTest.js](https://github.com/nerac/keyu/blob/master/test/concurrencyTest.js)
 * @argument {Array(Promise)} promises An array of all promises to be executed
 * @returns {Array(Object)}
 * @example
 * await full([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)])
 * // [ { value: 1 }, { error: 2 }, { value: 3 } ]
 * @see [concurrencyTest.js](https://github.com/nerac/keyu/blob/master/test/concurrencyTest.js)
 * @method
 */
const full = promises => Promise.all(promises.map(promise => promise.then(value => ({ value })).catch(error => ({ error }))));

/** Given **N promises** will return <u>the fastest non-failed one</u>.
 * This pattern can be useful some times to reduce latency.
 * @see [When Do Redundant Requests Reduce Latency?](https://ieeexplore.ieee.org/document/7348681)
 * @see [Rob-Pike](https://www.youtube.com/watch?v=f6kdp27TYZs)
 * @argument {Array(Promise)} promises An array of all promises to be executed
 * @returns {Promise}
 * @example
 * await best([Promise.resolve(1),Promise.resolve(2)]) // -> 1 (assuming 1 is the first to resolve)
 * await best([Promise.reject(1),Promise.resolve(2)]) // -> 2
 * @see [concurrencyTest.js](https://github.com/nerac/keyu/blob/master/test/concurrencyTest.js)
 * @method
 */
const best = promises =>
  new Promise((resolve, reject, errors = []) => {
    promises.map(promise =>
      promise.then(resolve).catch(err => {
        errors.push(err);
        if (errors.length === promises.length) {
          reject(errors);
        }
      })
    );
  });

module.exports = { best, full };
