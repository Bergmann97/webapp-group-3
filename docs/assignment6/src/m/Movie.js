/**
 * @author Christian Prinz
 */
import { Enumeration } from "../../lib/Enumeration.js";
import {
  IntervalConstraintViolation,
  MandatoryValueConstraintViolation,
  NoConstraintViolation,
  RangeConstraintViolation,
  UniquenessConstraintViolation,
} from "../../lib/errorTypes.js";
import {
  getRawDate,
  isDateOrDateString,
  isIntegerOrIntegerString,
  isStringInRange,
  parseDate,
  parseStringInteger,
} from "../../lib/util.js";
import { MovieStorage } from "./MovieStorage.js";
import { Person } from "./Person.js";
import { PersonStorage } from "./PersonStorage.js";

// *** ENUMERATIONS ***********************************************************

export const GenreEL = new Enumeration([
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Family",
  "Film-Noir",
  "Horror",
  "Musical",
  "Romance",
  "Sci-Fi",
  "War",
]);
export const MovieRatingEL = new Enumeration({
  G: "General Audiences",
  PG: "Parental Guidance",
  PG13: "Not Under 13",
  R: "Restricted",
  NC17: "Not Under 17",
});

/**
 * The creation slots of the movie.
 * @typedef {object} MovieSlots
 * @prop {number | string} movieId
 * @prop {string} title
 * @prop {Date | string | undefined} releaseDate
 * @prop {Person | number | string} director
 * @prop {Person[] | number[] | string[] | {[key: string]: Person} | undefined} actors
 */

/**
 * The entity of a Movie
 */
export class Movie {
  /** the unique identifier of the movie
   * - unique required PositiveInteger {id}
   *
   * @private
   * @type {number}
   */
  _movieId;

  /** the official title of the movie
   * - required NonEmptyString(120)
   * @private
   * @type {string}
   */
  _title;

  /** the date the movie was released
   * - optional
   * - Date
   * - min: "1895-12-28"
   * @private
   * @type {Date}
   */
  _releaseDate;

  /** the director of the movie
   * - required Person
   * @private
   * @type {Person}
   */
  _director;

  /** the actors starring the movie
   * - optional multiValue
   * @private
   * @type {{[key: string]: Person}}
   */
  _actors;

  /**
   * CONSTRUCTOR
   * @param {MovieSlots} slots - Object creation slots
   */
  constructor({ movieId, title, releaseDate, director, actors }) {
    if (arguments.length > 0) {
      this.movieId = movieId;
      this.title = title;
      if (releaseDate) {
        this.releaseDate = releaseDate;
      }
      this.director = director;
      if (actors) {
        this.actors = actors;
      } else {
        this.actors = [];
      }
    }
  }

  // *** movieId **************************************************************

  /**
   * @returns {number} the unique identifier of the movie
   */
  get movieId() {
    return this._movieId;
  }

  /**
   * sets a new movieId
   * - @private this is just used internally though the id is frozen
   * @param {number | string}     movieId
   */
  set movieId(movieId) {
    const validationResult = Movie.checkMovieId(movieId);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = parseStringInteger(movieId);
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given movieId is present, >0 and unique
   * @param {number | string} movieId
   * @returns a ConstraintViolation
   */
  static checkMovieId(movieId) {
    if (!movieId && movieId !== 0) {
      return new MandatoryValueConstraintViolation(
        "The movie's movieId is required!"
      );
    } else if (!isIntegerOrIntegerString(movieId)) {
      return new RangeConstraintViolation(
        `The movie's movieId  must be an Integer, but is (${movieId}: ${typeof Movie})!`
      );
    } else if (parseStringInteger(movieId) < 0) {
      return new IntervalConstraintViolation(
        `The movie's movieId must be larger than 0, but is ${movieId}!`
      );
    } else if (MovieStorage.contains(movieId)) {
      return new UniquenessConstraintViolation(
        `The movie's movieId (${movieId}) is already taken by another movie!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  // *** title ****************************************************************

  /** @returns {string} the official title of the movie */
  get title() {
    return this._title;
  }

  /** @param {string} title - the new title to set */
  set title(title) {
    const validationResult = Movie.checkTitle(title);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = title.trim();
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given title is present and between [1,120] letters
   * @param {string} title
   * @returns a ConstraintViolation
   * @public
   */
  static checkTitle(title) {
    if (!title) {
      return new MandatoryValueConstraintViolation(
        "The movie's title is required!"
      );
    } else if (typeof title !== "string") {
      return new RangeConstraintViolation(
        `The movie's title (${title}) must be of type "string", but is ${typeof title}!`
      );
    } else if (!isStringInRange(title.trim(), 1, 120)) {
      return new IntervalConstraintViolation(
        `The movie's title must have a length between 1 and 120 letters, but is ${title.length}!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  // *** releaseDate **********************************************************

  /** @returns {Date} the date the movie was released */
  get releaseDate() {
    return this._releaseDate;
  }

  /** @param {Date | string} date - the new date to set */
  set releaseDate(date) {
    const validationResult = Movie.checkReleaseDate(date);
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = parseDate(date);
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given date is of type Date and >= 1895-12-28
   * @param {Date | string} date
   * @returns a ConstraintViolation
   */
  static checkReleaseDate(date) {
    if (!date || date === "") {
      return new NoConstraintViolation();
    } else if (!isDateOrDateString(date)) {
      return new RangeConstraintViolation(
        `The movie's releaseDate must be of type "Date" or a valid date string, but is (${date}: ${typeof date})!`
      );
    } else if (parseDate(date) < new Date("1895-12-28")) {
      return new IntervalConstraintViolation(
        `The movie's releaseDate must be after 1895-12-28, but is ${getRawDate(
          parseDate(date)
        )}!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  /** deletes the `releaseDate`of this movie */
  deleteReleaseDate() {
    delete this._releaseDate;
  }

  // *** director *************************************************************

  /** @returns {Person} the director (`Person`) of the movie */
  get director() {
    return this._director;
  }

  /** @param {Person | number | string} director the `Person` or it's `personId` */
  set director(director) {
    const director_id =
      typeof director !== "object" ? director : director.personId;
    const validationResult = Movie.checkDirector(director_id);
    if (validationResult instanceof NoConstraintViolation) {
      // create the new director reference
      this._director = PersonStorage.instances[director_id];
    } else {
      throw validationResult;
    }
  }

  /** @param {number | string} director_id */
  static checkDirector(director_id) {
    return Person.checkPersonIdAsIdRef(director_id);
  }

  // *** actors ***************************************************************

  /** @returns {{[key: string]: Person}} a Map of actors (*key = `person.Id`*) starring the movie */
  get actors() {
    return this._actors;
  }

  /** @param {Person[] | number[] | string[] | {[key: string]: Person} | undefined} actors an array of `Person`s or an array of `personId`s or a `Map<personId, Person>` */
  set actors(actors) {
    // clear and add actors
    this._actors = {};
    this.addActors(actors);
  }

  /** @param {number | string} actor */
  static checkActor(actor) {
    return Person.checkPersonIdAsIdRef(actor);
  }

  /** @param {Person[] | number[] | string[] | {[key: string]: Person} | undefined} actors an array of `Person`s or an array of `personId`s or a `Map<personId, Person>` */
  addActors(actors) {
    if (Array.isArray(actors)) {
      // array of IdRefs
      for (let idRef of actors) {
        this.addActor(idRef);
      }
    } else {
      // map of IdRefs to object references
      for (let idRef of Object.keys(actors)) {
        this.addActor(actors[idRef]);
      }
    }
  }

  /** @param {Person | number | string} actor the `Person` or it's `personId` */
  addActor(actor) {
    // actor can be an ID reference or an object reference
    const actor_id = typeof actor !== "object" ? actor : actor.personId;
    const validationResult = Movie.checkActor(actor_id);
    if (actor_id && validationResult instanceof NoConstraintViolation) {
      // add the new actor reference
      let key = String(actor_id);
      this._actors[key] = PersonStorage.instances[key];
    } else {
      throw validationResult;
    }
  }

  /** @param {Person[] | number[] | string[] | {[key: string]: Person} | undefined} actors an array of `Person`s or an array of `personId`s or a `Map<personId, Person>` */
  removeActors(actors) {
    if (Array.isArray(actors)) {
      // array of IdRefs
      for (let idRef of actors) {
        this.removeActor(idRef);
      }
    } else {
      // map of IdRefs to object references
      for (let idRef of Object.keys(actors)) {
        this.removeActor(actors[idRef]);
      }
    }
  }

  /** @param {Person | number | string} actor the `Person` or it's `personId` */
  removeActor(actor) {
    // a can be an ID reference or an object reference
    const actor_id = typeof actor !== "object" ? actor : actor.personId;
    const validationResult = Movie.checkActor(actor_id);
    if (validationResult instanceof NoConstraintViolation) {
      // delete the actor reference
      delete this._actors[String(actor_id)];
    } else {
      throw validationResult;
    }
  }

  // *** serialization ********************************************************

  /**
   * a static function that creates a `new Movie` from a serialized one.
   * @param {MovieSlots} slots - Object creation slots
   * @returns {Movie | null} a new `Movie` with the corresponding slots if they pass their constraints. `null` otherwise.
   */
  static deserialize(slots) {
    let movie = null;
    try {
      movie = new Movie({
        movieId: slots.movieId,
        title: slots.title,
        releaseDate: slots.releaseDate,
        director: slots.director,
        actors: slots.actors,
      });
    } catch (e) {
      console.warn(
        `${e.constructor.name} while deserializing a movie: ${e.message}`
      );
      movie = null;
    }
    return movie;
  }

  /**
   * this function is invoked by `JSON.stringify()` and converts the inner `"_propertyKey"` to `"propertyKey"`
   * @returns {{}} the JSON object of the movie
   */
  toJSON() {
    const rec = {};
    for (let p of Object.keys(this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          // convert object reference to ID reference
          rec.director = this._director.personId;
          break;
        case "_actors":
          // convert the map of object references to a list of ID references
          rec.actors = [];
          Object.keys(this.actors).forEach((actorIdStr) => {
            rec.actors.push(parseInt(actorIdStr));
          });
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }

  /** @returns the stringified Movie */
  toString() {
    var movieStr = `Movie{movieId: ${this.movieId}, title: ${
      this.title
    }, releaseDate: ${
      this._releaseDate ? this.releaseDate.toLocaleDateString() : "undefined"
    }, director: ${this._director.toString()}`;
    return movieStr + `}`;
  }
}
