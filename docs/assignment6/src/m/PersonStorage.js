import { cloneObject } from "../../lib/util.js";
import { Person } from "./Person.js";

/** key for the `localStorage[key]` for the `this.instances` */
const PERSON_STORAGE_KEY = "person";

/**
 * internal
 */
class _PersonStorage {
  /** the current instances of `Person`s used as a collection map
   * @private
   * @type {{[key: string]: Person}}
   */
  _instances = {};

  /** the internally used "counter" of the Persons identifiers
   * @private
   * @type {number}
   */
  _nextId = 0;

  get instances() {
    return this._instances;
  }

  /**
   * adds a new Person created from the given `slots` to the collection of `Person`s
   * if the slots fulfill their constraints. Does nothing otherwise
   * @param {{personId: number, name: string}} slots - Object creation slots
   */
  add(slots) {
    let person = null;
    try {
      person = new Person(slots);
    } catch (e) {
      console.warn(`${e.constructor.name}: ${e.message}`);
      person = null;
    }
    if (person) {
      this._instances[person.personId] = person;
      this.setNextId(person.personId + 1);
      console.info(`${person.toString()} created`, person);
    }
  }

  /**
   * updates the `Person` with the corresponding `slots.personId` and overwrites it's `name`.
   * @param {{personId: number, name: string}} slots - Object creation slots
   */
  update(slots) {
    const { personId, name, agent } = slots;
    var noConstraintViolated = true;
    var updatedProperties = [];
    const person = this._instances[personId];
    const objectBeforeUpdate = cloneObject(person);

    try {
      // update name
      if (person.name !== name) {
        person.name = name;
        updatedProperties.push("name");
      }
      // update agent
      if (person.agent !== agent) {
        person.agent = agent;
        updatedProperties.push("agent");
      }
    } catch (e) {
      console.warn(`${e.constructor.name}: ${e.message}`);
      noConstraintViolated = false;
      // restore object to its state before updating
      this._instances[personId] = objectBeforeUpdate;
    }
    if (noConstraintViolated) {
      if (updatedProperties.length > 0) {
        console.info(
          `Properties ${updatedProperties.toString()} modified for person ${personId}`,
          person
        );
      } else {
        console.info(`No property value changed for person ${personId}!`);
      }
    }
  }

  /**
   * Deletes the `Person` with the corresponding `personId` from the Storage.
   * Before that the callback `onDestroy` will be called with the corresponding `Person` so
   * that the references on this person can be deleted from outside of this class.
   * - eg. for deleting mandatory references:
   *   ```javascript
   *   PersonStorage.destroy(3,
   *     (person) => MovieStorage.destroyAll(
   *       (movie) => movie.director.name === person.name
   *     )
   *   );
   *   ```
   * - or for deleting optional / multiValued references.:
   *   ```javascript
   *   PersonStorage.destroy(3,
   *     (person) => MovieStorage.updateAll(
   *       {actorsToRemove: [person]},
   *       (movie) => movie.actors[person.name] !== undefined
   *     )
   *   );
   *   ```
   * @param {string} personId to delete
   * @param {(person: Person) => void} onDestroy callback that can be used to delete references
   */
  destroy(personId, onDestroy) {
    if (this._instances[personId]) {
      // call onDestroy to make sure the references can be deleted to
      // onDestroy(this._instances[personId]);

      // delete the Person
      console.info(`${this._instances[personId].toString()} deleted`);
      delete this._instances[personId];

      // calculate nextId when last id is destroyed
      personId === this._nextId.toString() && this.calculateNextId();
    } else {
      console.info(
        `There is no person with id ${personId} to delete from the database`
      );
    }
  }

  /**
   * loads all stored Persons from the `localStorage`, parses them and stores them
   * to this Repo
   */
  retrieveAll() {
    let serialized = "";
    try {
      if (localStorage[PERSON_STORAGE_KEY]) {
        serialized = localStorage[PERSON_STORAGE_KEY];
      }
    } catch (e) {
      alert("Error when reading from Local Storage\n" + e);
    }
    if (serialized && serialized.length > 0) {
      const persons = JSON.parse(serialized);
      const keys = Object.keys(persons);
      console.info(`${keys.length} person loaded`, persons);
      for (const key of keys) {
        const person = Person.deserialize(persons[key]);
        this._instances[key] = person;

        // store the current highest id (for receiving the next id later)
        this.setNextId(Math.max(person.personId + 1, this._nextId));
      }
    }
  }

  /**
   * stores all `Person`s from this Repo to the `localStorage`
   */
  persist() {
    var serialized = "";
    var error = false;
    const nmrOfPersons = Object.keys(this._instances).length;
    try {
      serialized = JSON.stringify(this._instances);
      localStorage.setItem(PERSON_STORAGE_KEY, serialized);
    } catch (e) {
      alert("Error when writing to Local Storage\n" + e);
    }

    !error && console.info(`${nmrOfPersons} person saved.`);
  }

  /**
   * checks if a `Person` with the given `personId` exists in the storage.
   * @param {number | string} personId the identifier of the person to check
   * @returns true if the person exists in the storage
   */
  contains(personId) {
    return Object.keys(this._instances).includes(personId.toString());
  }

  /*****************************************************************************
   *** ID creation *************************************************************
   *****************************************************************************/

  /**
   * calculates the next possible id and stores it internally to `this._nextId`
   */
  calculateNextId() {
    let currentId = -1;
    for (let key of Object.keys(this._instances)) {
      const person = this._instances[key];
      currentId = Math.max(person.personId, currentId);
    }
    this.setNextId(currentId + 1);
  }

  /**
   * looks up the current highest identifier and returns the following identifier to use for
   * a possible `Person` to add next.
   * @returns the next identifier to use
   */
  nextId() {
    // calculate the missing id if not already done
    if (this._nextId === 0) {
      this.calculateNextId();
    }

    return this._nextId;
  }

  /** @private @param {number} id */
  setNextId(id) {
    this._nextId = id;
  }

  /*****************************************************************************
   *** Auxiliary methods for testing *******************************************
   *****************************************************************************/

  /**
   * clears all `Person`s from the `this.instances`
   */
  clear() {
    // if (confirm("Do you really want to delete all person?")) {
    try {
      this._instances = {};
      localStorage[PERSON_STORAGE_KEY] = "{}";
      this.setNextId(1);
      console.info("All person records cleared.");
    } catch (e) {
      console.warn(`${e.constructor.name}: ${e.message}`);
    }
    // }
  }

  /**
   * creates a set of 4 `Person`s and stores it in the first 4 slots of the `this.instances`
   * - TODO: upgrade to always push new person (requires ID automation)
   */
  createTestData() {
    try {
      this._instances[1] = new Person({ personId: 1, name: "Stephen Frears" });
      this._instances[2] = new Person({ personId: 2, name: "George Lucas" });
      this._instances[3] = new Person({
        personId: 3,
        name: "Quentin Tarantino",
      });
      this._instances[5] = new Person({ personId: 5, name: "Uma Thurman" });
      this._instances[6] = new Person({ personId: 6, name: "John Travolta" });
      this._instances[7] = new Person({ personId: 7, name: "Ewan McGregor" });
      this._instances[8] = new Person({ personId: 8, name: "Natalie Portman" });
      this._instances[9] = new Person({ personId: 9, name: "Keanu Reeves" });
      this.setNextId(10);
      this.persist();
    } catch (e) {
      console.warn(`${e.constructor.name}: ${e.message}`);
    }
  }
}

/**
 * a singleton instance of the `PersonStorage`.
 * - provides functions to create, retrieve, update and destroy `Person`s at the `localStorage`
 * - additionally provides auxiliary methods for testing
 */
export const PersonStorage = new _PersonStorage();
