import { FrozenValueConstraintViolation } from "../../lib/errorTypes.js";
import { cloneObject, compareDates } from "../../lib/util.js";
import { Movie, MovieCategoryEL } from "./Movie.js";
import { Person, PersonTypeEL } from "./Person.js";
import { PersonStorage } from "./PersonStorage.js";

/** key for the `localStorage[key]` for the `this.instances` */
const MOVIES_STORAGE_KEY = "movies";

/** The slots for updating a `Movie`
 * @typedef {object} MovieUpdateSlots
 * @prop {string} [title]
 * @prop {Date | string} [releaseDate]
 * @prop {Person | number | string} [director]
 * @prop {Person[] | number[] | string[] | {[key: string]: Person}} [actorsToAdd]
 * @prop {Person[] | number[] | string[] | {[key: string]: Person}} [actorsToRemove]
 * @prop {number | string} [category]
 * @prop {Person |number | string} [about]
 * @prop {string} [tvSeriesName]
 * @prop {number | string} [episodeNo]
 */

/**
 * internal
 */
class MovieStorageClass {
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
  update({
    movieId,
    title,
    releaseDate,
    director,
    actorsToAdd,
    actorsToRemove,
    category,
    about,
    episodeNo,
    tvSeriesName,
  }) {
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
      if (compareDates(releaseDate, movie.releaseDate) !== 0) {
        movie.releaseDate = releaseDate;
        updatedProperties.push("releaseDate");
      }

      // director
      if (
        typeof director !== "object"
          ? director !== movie.director.personId
          : director.personId !== movie.director.personId
      ) {
        movie.director = director;
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

      // category
      if (category) {
        if (movie.category === undefined) {
          movie.category = category;
          updatedProperties.push("category");
        } else if (category !== movie.category) {
          throw new FrozenValueConstraintViolation(
            "The movie category must not be changed!"
          );
        }
      } else if (category === "" && "category" in movie) {
        throw new FrozenValueConstraintViolation(
          "The movie category must not be unset!"
        );
      }

      // about
      if (movie.about !== about) {
        movie.about = about;
        updatedProperties.push("about");
      }

      // episodeNo
      if (movie.episodeNo !== episodeNo) {
        movie.episodeNo = episodeNo;
        updatedProperties.push("episodeNo");
      }

      // tvSeriesName
      if (movie.tvSeriesName !== tvSeriesName) {
        movie.tvSeriesName = tvSeriesName;
        updatedProperties.push("tvSeriesName");
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
   * deletes the `Movie` with the corresponding `movieId` from the Storage
   * @param {number | string} movieId
   */
  destroy(movieId) {
    if (this._instances[movieId]) {
      console.info(`${this._instances[movieId].toString()} deleted`);
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
   * checks for all movies if person is actor or director. if actor remove from
   * movie. if director delete movie.
   * Additionally checks if a movie is about this person and deletes it, because the about is
   * mandatory for category BIOGRAPHY and categories can't be changed
   * @param {Person} person of person to delete
   */
  destroyPersonRefs(person) {
    for (const movie of Object.values(this.instances)) {
      // check if director is person to delete
      if (movie.director.personId === person.personId) {
        // director is mandatory in movies
        this.destroy(movie.movieId);
      }
      // check if actors include person to delete
      if (Object.keys(movie.actors).includes(person.personId.toString())) {
        movie.removeActor(person);
      }
      if (
        movie.category === MovieCategoryEL["BIOGRAPHY"] &&
        movie.about.personId === person.personId
      ) {
        // about is mandatory in biographies
        this.destroy(movie.movieId);
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
      alert(
        "Error when writing to Local Storage in MovieStorage.persist()\n" + e
      );
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
export const MovieStorage = new MovieStorageClass();
