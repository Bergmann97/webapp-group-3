import { Enumeration } from "../../lib/Enumeration.js";
import {
  ConstraintViolation,
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

export const PersonTypeEL = new Enumeration(["Director", "Actor", "Agent"]);

/**
 * The primitive slots of the movie.
 * @typedef {object} PersonSlots
 * @prop {number | string} personId
 * @prop {string} name
 * @prop {number[]} categories
 * @prop {number | string} agent
 */

export class Person {
  /** the unique identifier of the person
   * - unique required PositiveInteger {id}
   * @private
   * @type {number | string}
   */
  _personId;
  /** the name of the person
   * - required NonEmptyString(120)
   * @private
   * @type {string}
   */
  _name;
  /** the kind of the person
   * @private
   * @type {number[]}
   */
  _categories;
  /** the Person that is the agent of this person
   * @private
   * @type {number | string} id as Ref to Person
   */
  _agent;

  /**
   * CONSTRUCTOR
   * @param {PersonSlots} slots - The Object creation slots
   */
  constructor({ personId, name, categories, agent }) {
    if (arguments.length > 0) {
      this._personId = personId;
      this._name = name;
      if (categories) {
        this._categories = categories;
      } else {
        this._categories = [];
      }
      if (agent) {
        this._agent = agent;
      } else {
        this._agent = null;
      }
    }
  }

  // *** personId ***********************************************************

  /**
   * @returns {number | string} the unique identifier of the person
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

  // *** category *************************************************************

  /** @returns {number[]} the category the person belongs to */
  get categories() {
    return this._categories;
  }

  /** @param {number[]} categories - the new category to set */
  set categories(categories) {
    this._categories = [];
    for (let cat in categories) {
      this.addCategory(cat);
    }
  }

  /**
   * check if category is legit and is already set
   * @param {string | number} category to add to the category list
   * @returns
   */
  addCategory(category) {
    if (isIntegerOrIntegerString(category)) {
      const cat = typeof category === "string" ? parseInt(category) : category;
      const valRes = Person.checkCategory(cat);
      if (valRes instanceof NoConstraintViolation) {
        // set the agents person type as agent if not already set
        if (!this._categories.includes(cat)) {
          this._categories.push(cat);
        }
      }
    } else {
      return new RangeConstraintViolation("Invalid value for category!");
    }
  }

  /**
   * check if the category can be removed
   * @param {number | string} category to remove from the existing ones
   */
  removeCategory(category) {
    if (isIntegerOrIntegerString(category)) {
      const cat = typeof category === "string" ? parseInt(category) : category;
      const valRes = Person.checkCategory(cat);
      if (valRes instanceof NoConstraintViolation) {
        // check if category is set, to remove, elsewise do nothing
        if (!this._categories.includes(PersonTypeEL[cat])) {
          this._categories.splice(this._categories.indexOf(cat), 1);
        }
      } else {
        throw valRes;
      }
    } else {
      return new RangeConstraintViolation("Invalid value for category!");
    }
  }

  /**
   * checks if the given category is legit
   * @param {number | string} category to check
   * @returns a ConstraintViolation
   * @public
   */
  static checkCategory(category) {
    if (category) {
      if (typeof category === "string") {
        if (parseInt(category) < 1 || parseInt(category) > PersonTypeEL.MAX) {
          return new RangeConstraintViolation("Invalid value for category!");
        }
      } else {
        if (category < 1 || category > PersonTypeEL.MAX) {
          return new RangeConstraintViolation("Invalid value for category!");
        }
      }
      return new NoConstraintViolation();
    } else {
      return new NoConstraintViolation();
    }
  }

  // *** agent ****************************************************************

  /** @returns {number | string} personId of the person that is agent of this person */
  get agent() {
    return this._agent;
  }

  /** @param {number | string} agent as person to set as id as ref to person */
  set agent(agent) {
    const validationResult = Person.checkAgent(agent);
    if (validationResult instanceof NoConstraintViolation) {
      this._agent = agent;
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given agent is legit
   * @param {string | number} agent as personID to check
   * @returns a ConstraintViolation
   * @public
   */
  static checkAgent(agent) {
    if (agent) {
      return Person.checkPersonIdAsIdRef(agent);
    } else {
      return new NoConstraintViolation();
    }
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
        categories: slots.categories,
        agent: slots.agent,
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
      if (p.charAt(0) === "_") {
        // remove underscore prefix
        rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }

  /** @returns the stringified Person */
  toString() {
    var addString = "";
    if (this._categories) {
      var catString = "categories: [";
      for (let cat in this.categories) {
        catString = catString + `, ${PersonTypeEL.labels[cat]}`;
      }
      catString = catString + "]";
      if (catString !== "categories: []") {
        addString = addString + catString;
      }
    }
    if (this._agent) {
      addString =
        addString + `, agent: ${PersonStorage.instances[this.agent]._name} `;
    }

    return (
      `Person{ personId: ${this.personId}, name: ${this.name}` +
      addString +
      ` }`
    );
  }
}
