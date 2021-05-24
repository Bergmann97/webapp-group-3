import {
  IntervalConstraintViolation,
  MandatoryValueConstraintViolation,
  NoConstraintViolation,
  RangeConstraintViolation,
  ReferentialIntegrityConstraintViolation,
  UniquenessConstraintViolation,
} from "../../lib/errorTypes.js";
import {
  isIntegerOrIntegerString,
  isStringInRange,
  parseStringInteger,
} from "../../lib/util.js";
import { PersonStorage } from "./PersonStorage.js";

/**
 * The primitive slots of the movie.
 * @typedef {object} PersonSlots
 * @prop {number} personId
 * @prop {string} name
 */

export class Person {
  /** the unique identifier of the person
   * - unique required PositiveInteger {id}
   * @private
   * @type {number}
   */
  _personId;
  /** the name of the person
   * - required NonEmptyString(120)
   * @private
   * @type {string}
   */
  _name;
  /** movies, the person directed
   * @private
   * @type {Movie[]}
   */
  _directedMovies;
  /** movies, the person played a role
   * @private
   * @type {Movie[]}
   */
  _playedMovies;

  /**
   * CONSTRUCTOR
   * @param {PersonSlots} slots - The Object creation slots
   */
  constructor({ personId, name, directedMovies, playedMovies }) {
    if (arguments.length > 0) {
      this._personId = personId;
      this._name = name;
      if (directedMovies) {
        this._directedMovies = directedMovies;
      } else {
        this._directedMovies = {};
      }
      if (playedMovies) {
        this._playedMovies = playedMovies;
      } else {
        this._playedMovies = {};
      }
    }
  }

  // *** personId ***********************************************************

  /**
   * @returns {number} the unique identifier of the person
   */
  get personId() {
    return this._personId;
  }

  /**
   * sets a new personId
   * - @private this is just used internally though the id is frozen
   * @param {number | string} personId
   */
  set personId(personId) {
    const validationResult = Person.checkPersonId(personId);
    if (validationResult instanceof NoConstraintViolation) {
      this._personId = parseStringInteger(personId);
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given personId is present, >0 and unique
   * @param {number | string} personId
   * @returns a ConstraintViolation
   */
  static checkPersonId(personId) {
    if (!personId && personId !== 0) {
      return new MandatoryValueConstraintViolation(
        "The person's personId is required!"
      );
    } else if (!isIntegerOrIntegerString(personId)) {
      return new RangeConstraintViolation(
        `The person's personId  must be an Integer, but is (${personId}: ${typeof Person})!`
      );
    } else if (parseStringInteger(personId) < 0) {
      return new IntervalConstraintViolation(
        `The person's personId must be larger than 0, but is ${personId}!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  /**
   * @param {number | string} personId
   * @returns a ConstraintViolation
   */
  static checkPersonIdAsId(personId) {
    let validationResult = Person.checkPersonId(personId);
    if (validationResult instanceof NoConstraintViolation) {
      if (PersonStorage.contains(personId)) {
        return new UniquenessConstraintViolation(
          `The person's personId (${personId}) is already taken by another person!`
        );
      } else {
        return new NoConstraintViolation();
      }
    }
    return validationResult;
  }

  /**
   * @param {number | string} personId
   * @returns a ConstraintViolation
   */
  static checkPersonIdAsIdRef(personId) {
    let validationResult = Person.checkPersonId(personId);
    if (validationResult instanceof NoConstraintViolation) {
      if (!PersonStorage.contains(personId)) {
        return new ReferentialIntegrityConstraintViolation(
          `The person with personId (${personId}) cannot be found!`
        );
      }
    }
    return validationResult;
  }

  // *** name ****************************************************************

  /** @returns {string} the official name of the person */
  get name() {
    return this._name;
  }

  /** @param {string} name - the new name to set */
  set name(name) {
    const validationResult = Person.checkName(name);
    if (validationResult instanceof NoConstraintViolation) {
      this._name = name.trim();
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given name is present and between [1,120] letters
   * @param {string} name
   * @returns a ConstraintViolation
   * @public
   */
  static checkName(name) {
    if (!name) {
      return new MandatoryValueConstraintViolation(
        "The person's name is required!"
      );
    } else if (typeof name !== "string") {
      return new RangeConstraintViolation(
        `The person's name (${name}) must be of type "string", but is ${typeof name}!`
      );
    } else if (!isStringInRange(name.trim(), 1)) {
      return new IntervalConstraintViolation(
        `The person's name must have at least one letter, but the length is ${name.length}!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  // *** directed Movie *******************************************************
  get directedMovies() {
    return this._directedMovies;
  }

  // *** played  Movie ********************************************************
  get playedMovies() {
    return this._playedMovies;
  }

  // *** serialization ********************************************************

  /**
   * a static function that creates a `new Person` from a serialized one.
   * @param {PersonSlots} slots - Object creation slots
   * @returns {Person | null} a new `Person` with the corresponding slots if they pass their constraints. `null` otherwise.
   */
  static deserialize(slots) {
    let person = null;
    try {
      person = new Person({
        personId: slots.personId,
        name: slots.name,
        directedMovies: slots.directedMovies,
        playedMovies: slots.playedMovies,
      });
    } catch (e) {
      console.warn(
        `${e.constructor.name} while deserializing a person: ${e.message}`
      );
      person = null;
    }
    return person;
  }

  /**
   * this function is invoked by `JSON.stringify()` and converts the inner `"_propertyKey"` to `"propertyKey"`
   * @returns {{}} the JSON object of the person
   */
  toJSON() {
    const rec = {};
    for (let p of Object.keys(this)) {
      // copy only property slots with underscore prefix
      if (
        p.charAt(0) === "_" &&
        p !== "_directedMovies" &&
        p !== "_playedMovies"
      ) {
        // remove underscore prefix
        rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }

  /** @returns the stringified Person */
  toString() {
    return `Person{ personId: ${this.personId}, name: ${this.name}, directedMovies: ${this.directedMovies}, playedMovies: ${this.playedMovies} }`;
  }
}
