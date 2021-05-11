/**
 * @fileOverview  Browser shims are extensions of built-in objects. Here, we extend
 * the built-in object "Array", representing a class, by adding two class-level
 * functions ("max" and "min"), and two instance-level functions ("clone" and "isEqualTo")
 * @author Gerd Wagner
 * @author Christian Prinz
 */
/**
 * Compute the max/min of an array
 * Notice that "apply" requires a context object, which is not really used
 * in the case of a static function such as Math.max
 */
/** @ts-ignore @param {any[]} array @returns the maximum value of an array */
Array.max = (array) => Math.max.apply(Math, array);

/** @ts-ignore @param {any[]} array @returns the minimum value of an array */
Array.min = (array) => Math.min.apply(Math, array);

/**
 * Clone an array
 * @returns {any[]} the cloned array
 */
Array.prototype.clone = () => this.slice(0);

/**
 * Test if an array is equal to another one (in every value)
 * @param {any[]} a2 the array to test on equality
 * @returns true if the array is equal
 */
Array.prototype.isEqualTo = (a2) =>
  this.length === a2.length && this.every((el, i) => el === a2[i]);
