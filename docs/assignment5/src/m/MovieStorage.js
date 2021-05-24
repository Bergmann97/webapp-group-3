import { cloneObject, compareDates } from "../../lib/util.js";
import { Movie } from "./Movie.js";
import { Person } from "./Person.js";
import { PersonStorage } from "./PersonStorage.js";

/** key for the `localStorage[key]` for the `this.instances` */
const MOVIES_STORAGE_KEY = "movies";

/** The slots for updating a `Movie`
 * @typedef {object} MovieUpdateSlots
 * @prop {string} [title]
 * @prop {Date | string | undefined} [releaseDate]
 * @prop {Person | number | string} [director]
 * @prop {Person[] | number[] | string[] | {[key: string]: Person}} [actorsToAdd]
 * @prop {Person[] | number[] | string[] | {[key: string]: Person}} [actorsToRemove]
 */

/**
 * internal
 */
class _MovieStorage {
  /** the current instances of `Movie`s used as a collection map
   * @private
   * @type {{[key: string]: Movie}}
   */
  _instances = {};

  /** the internally used "counter" of the Movies identifiers
   * @private
   * @type {number}
   */
  _nextId = 0;

  get instances() {
    return this._instances;
  }

  /**
   * adds a new Movie created from the given `slots` to the collection of `Movie`s
   * if the slots fulfill their constraints. Does nothing otherwise
   * @param {import("./Movie.js").MovieSlots} slots - Object creation slots
   */
  add(slots) {
    /** @type {Movie} */
    let movie = null;
    try {
      movie = new Movie(slots);
    } catch (e) {
      console.warn(`${e.constructor.name}: ${e.message}`);
      movie = null;
    }
    if (movie) {
      this._instances[movie.movieId] = movie;
      this.setNextId(movie.movieId + 1);
      console.info(`${movie.toString()} created`, movie);
    }
  }

  /**
   * updates the `Movie` with the corresponding `slots.movieId` and overwrites it's `title`, `genres`, `rating`
   * and/or `releaseDate` if they are defined and different
   * @param {{movieId: number | string} & MovieUpdateSlots} slots - Object creation slots
   */
  update(slots) {
    const {
      movieId,
      title,
      releaseDate,
      director,
      actorsToAdd,
      actorsToRemove,
    } = slots;
    let noConstraintViolated = true;
    let updatedProperties = [];
    const movie = this._instances[movieId];
    const objectBeforeUpdate = cloneObject(movie);

    try {
      // update title
      if (movie.title !== title) {
        movie.title = title;
        updatedProperties.push("title");
      }

      // update releaseDate
      switch (compareDates(releaseDate, movie.releaseDate)) {
        // no change
        case 0:
          break;
        // slots.releaseDate has an empty value that is new
        case -2:
          movie.deleteReleaseDate();
          updatedProperties.push("releaseDate");
          break;
        // slots.releaseDate has a non-empty value that is new
        default:
          // @ts-ignore
          movie.releaseDate = releaseDate;
          updatedProperties.push("releaseDate");
          break;
      }

      // director
      if (
        typeof director !== "object"
          ? director !== movie.director.personId
          : director.personId
      ) {
        const newDirector = PersonStorage.instances[director];
        const directorBeforeUpdate = movie.director;
        movie.director = director;
        // set the movie to the directed Movies of the person
        newDirector._directedMovies[movie.movieId] = movie;
        // delete this movie from the directed movies of the previous director
        delete directorBeforeUpdate.directedMovies[movie.movieId];
        updatedProperties.push("director");
      }

      // actors
      if (actorsToAdd) {
        movie.addActors(actorsToAdd);
        updatedProperties.push("actors(added)");
      }
      if (actorsToRemove) {
        movie.removeActors(actorsToRemove);
        updatedProperties.push("actors(removed)");
      }
    } catch (e) {
      console.warn(`${e.constructor.name}: ${e.message}`);
      noConstraintViolated = false;
      // restore object to its state before updating
      this._instances[movieId] = objectBeforeUpdate;
    }
    if (noConstraintViolated) {
      if (updatedProperties.length > 0) {
        console.info(
          `Properties ${updatedProperties.toString()} modified for movie ${movieId}`,
          movie
        );
      } else {
        console.info(`No property value changed for movie ${movieId}!`);
      }
    }
  }

  /**
   * updates all `Movie`s from the storage that match with the corresponding `filter` on the given slots.
   * - eg.:
   *   ```javascript
   *   MovieStorage.updateAll(
   *     {director: "Reddington"},
   *     (movie) => movie.director.name === "Mr. Kaplan"
   *   );
   *   ```
   * - the `filter` is optional and defaults to *all movies*
   * @param {MovieUpdateSlots} slots to update on all (filtered) movies
   * @param {(movie: Movie) => boolean} filter that the movies have to fulfill with `true` to be updated (defaults to all movies)
   */
  updateAll(slots, filter = (a) => true) {
    for (const mKey in this._instances) {
      if (Object.hasOwnProperty.call(this._instances, mKey)) {
        const movie = this._instances[mKey];
        filter(movie) && this.update({ movieId: movie.movieId, ...slots });
      }
    }
  }

  /**
   * deletes the `Movie` with the corresponding `movieId` from the Storage
   * @param {string} movieId
   */
  destroy(movieId) {
    if (this._instances[movieId]) {
      console.info(`${this._instances[movieId].toString()} deleted`);
      const movie = this._instances[movieId];
      // remove this movie from director and actors participated movies
      delete movie.director.directedMovies[movie];
      for (let actor in movie.actors) {
        delete actor.playedMovies[movie];
      }
      // finally destroy the movie
      delete this._instances[movieId];
      // calculate nextId when last id is destroyed
      movieId === this._nextId.toString() && this.calculateNextId();
    } else {
      console.info(
        `There is no movie with id ${movieId} to delete from the database`
      );
    }
  }

  /**
   * deletes all `Movie`s from the storage that match with the corresponding `filter`
   * - eg.:
   *   ```javascript
   *   MovieStorage.destroyAll((movie) => movie.director.name === "Mr. Kaplan");
   *   ```
   * - the `filter` is optional and defaults to *all movies*
   * @param {(movie: Movie) => boolean} filter that the movies have to fulfill with `true` to be deleted (defaults to all movies)
   */
  destroyAll(filter = (a) => true) {
    for (const mKey in this._instances) {
      if (Object.hasOwnProperty.call(this._instances, mKey)) {
        filter(this._instances[mKey]) && delete this._instances[mKey];
      }
    }
  }

  /**
   * loads all stored Movies from the `localStorage`, parses them and stores them
   * to this Repo
   */
  retrieveAll() {
    let serialized = "";
    try {
      if (localStorage[MOVIES_STORAGE_KEY]) {
        serialized = localStorage[MOVIES_STORAGE_KEY];
      }
    } catch (e) {
      alert("Error when reading from Local Storage\n" + e);
    }
    if (serialized && serialized.length > 0) {
      const movies = JSON.parse(serialized);
      const keys = Object.keys(movies);
      console.info(`${keys.length} movies loaded`, movies);
      for (const key of keys) {
        const movie = Movie.deserialize(movies[key]);
        this._instances[key] = movie;

        // store the current highest id (for receiving the next id later)
        this.setNextId(Math.max(movie.movieId + 1, this._nextId));
      }
    }
  }

  /**
   * stores all `Movie`s from this Repo to the `localStorage`
   */
  persist() {
    let serialized = "";
    let error = false;
    const nmrOfMovies = Object.keys(this._instances).length;
    try {
      serialized = JSON.stringify(this._instances);
      localStorage.setItem(MOVIES_STORAGE_KEY, serialized);
    } catch (e) {
      alert("Error when writing to Local Storage\n" + e);
    }

    !error && console.info(`${nmrOfMovies} movies saved.`);
  }

  /**
   * checks if a `Movie` with the given `movieId` exists in the storage.
   * @param {number | string} movieId the identifier of the movie to check
   * @returns true if the movie exists in the storage
   */
  contains(movieId) {
    return Object.keys(this._instances).includes(movieId.toString());
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
      const movie = this._instances[key];
      currentId = Math.max(movie.movieId, currentId);
    }
    this.setNextId(currentId + 1);
  }

  /**
   * looks up the current highest identifier and returns the following identifier to use for
   * a possible `Movie` to add next.
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

  /**
   * clears all `Movie`s from the `this.instances`
   */
  clear() {
    // if (confirm("Do you really want to delete all movies?")) {
    try {
      this._instances = {};
      localStorage[MOVIES_STORAGE_KEY] = "{}";
      this.setNextId(1);
      console.info("All movie records cleared.");
    } catch (e) {
      console.warn(`${e.constructor.name}: ${e.message}`);
    }
    // }
  }
}

/**
 * a singleton instance of the `MovieStorage`.
 * - provides functions to create, retrieve, update and destroy `Movie`s at the `localStorage`
 * - additionally provides auxiliary methods for testing
 */
export const MovieStorage = new _MovieStorage();
