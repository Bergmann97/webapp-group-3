/**
 * @author Christian Prinz
 */
import { Enumeration } from "../../lib/Enumeration.js";
import {
  ConstraintViolation,
  FrozenValueConstraintViolation,
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

export const MovieCategoryEL = new Enumeration([
  "Biography",
  "TvSeriesEpisode",
]);

/**
 * The creation slots of the movie.
 * @typedef {object} MovieSlots
 * @prop {number | string} movieId
 * @prop {string} title
 * @prop {Date | string} releaseDate
 * @prop {Person | number | string} director
 * @prop {Person[] | number[] | string[] | {[key: string]: Person} } [actors]
 * @prop {number | string} [category]
 * @prop {Person} [about]
 * @prop {string} [tvSeriesName]
 * @prop {number | string} [episodeNo]
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

  /** the (optional) category of this
   * - optional Enumeration
   * @private
   * @type {number}
   */
  _category;

  /** the `Person` the `Biography`is about
   * - depended required Person
   * @private
   * @type {Person}
   */
  _about;

  /** the official title of the TV series this episode is from
   * - depended required NonEmptyString
   * @private
   * @type {string}
   */
  _tvSeriesName;

  /** the number of the episode
   * - depended required PositiveInteger
   *
   * @private
   * @type {number}
   */
  _episodeNo;

  /**
   * CONSTRUCTOR
   * @param {MovieSlots} slots - Object creation slots
   */
  constructor({
    movieId,
    title,
    releaseDate,
    director,
    actors,
    category,
    about,
    tvSeriesName,
    episodeNo,
  }) {
    if (arguments.length > 0) {
      this.movieId = movieId;
      this.title = title;
      this.releaseDate = releaseDate;
      this.director = director;
      this.actors = actors ?? [];
      this.category = category;
      this.about = about;
      this.tvSeriesName = tvSeriesName;
      this.episodeNo = episodeNo;
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
        `The movie's movieId  must be an Integer, but is (${movieId}: ${typeof movieId})!`
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
    if (!isDateOrDateString(date)) {
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
      PersonStorage.instances[key].addCategory(1);
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
      PersonStorage.instances[actor_id].addCategory(1);
    } else {
      throw validationResult;
    }
  }

  // *** category *************************************************************

  /**
   * @returns {number} the (enum) number of the movie's category.
   * Use with `MovieCategoryEL[category]`.
   */
  get category() {
    return this._category;
  }

  /** @param {number | string} category - the (enum) number of the category */
  set category(category) {
    const validationResult = this.category
      ? new FrozenValueConstraintViolation(
          `The movie's category (${this.category}) must not be changed (to${category})`
        )
      : Movie.checkCategory(category);
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseStringInteger(category);
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given category is part of the enum `MovieCategoryEL`
   * @param {number | string} category the (enum) number of the movies category
   * @returns a ConstraintViolation
   */
  static checkCategory(category) {
    if (!category || "") {
      return new NoConstraintViolation(); // optional
    } else if (!isIntegerOrIntegerString(category)) {
      return new RangeConstraintViolation(
        `The movie's category must be of type number, but is (${category}: ${typeof category})!`
      );
    } else if (
      parseStringInteger(category) < 1 ||
      parseStringInteger(category) > MovieCategoryEL.MAX
    ) {
      return new IntervalConstraintViolation(
        `The movie's category (${category}) is not in the enumeration MovieCategoryEL [1,${MovieCategoryEL.MAX}]`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  // *** about ****************************************************************

  /** @returns {Person} the `Person` this biography is about */
  get about() {
    return this._about;
  }

  /** @param {Person | number | string} about the `Person` or it's `personId` */
  set about(about) {
    const about_id = typeof about !== "object" ? about : about.personId;
    const validationResult = Movie.checkAbout(about_id, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      // create the new about reference
      this._about = PersonStorage.instances[about_id];
    } else {
      throw validationResult;
    }
  }

  /**
   * @param {number | string} about_id
   * @param {number} movieCategory
   */
  static checkAbout(about_id, movieCategory) {
    const category = parseStringInteger(movieCategory);
    if (category === MovieCategoryEL["BIOGRAPHY"] && !about_id) {
      return new MandatoryValueConstraintViolation(
        "A biography movie must have an 'about' field!"
      );
    } else if (category !== MovieCategoryEL["BIOGRAPHY"] && about_id) {
      return new ConstraintViolation(
        "An 'about' field value must not " +
          "be provided if the movie is not a biography!"
      );
    } else if (about_id) {
      return Person.checkPersonIdAsIdRef(about_id);
    } else {
      return new NoConstraintViolation();
    }
  }

  // *** tvSeriesName *********************************************************

  /** @returns {string} the official title of the TV series this episode is from */
  get tvSeriesName() {
    return this._tvSeriesName;
  }

  /** @param {string} tvSeriesName - the new tvSeriesName to set */
  set tvSeriesName(tvSeriesName) {
    const validationResult = Movie.checkTvSeriesName(
      tvSeriesName,
      this.category
    );
    if (validationResult instanceof NoConstraintViolation) {
      this._tvSeriesName = tvSeriesName.trim();
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given tvSeriesName is present and not empty
   * @param {string} tvSeriesName
   * @param {number} movieCategory
   * @public
   */
  static checkTvSeriesName(tvSeriesName, movieCategory) {
    const category = parseStringInteger(movieCategory);
    if (category === MovieCategoryEL["TvSeriesEpisode"] && !tvSeriesName) {
      return new MandatoryValueConstraintViolation(
        "A TvSeriesEpisode must have a 'tvSeriesName' field!"
      );
    } else if (
      category !== MovieCategoryEL["TvSeriesEpisode"] &&
      tvSeriesName
    ) {
      return new ConstraintViolation(
        "An 'tvSeriesName' field value must not " +
          "be provided if the movie is not a TvSeriesEpisode!"
      );
    } else if (!isStringInRange(tvSeriesName.trim(), 1)) {
      return new IntervalConstraintViolation(
        `The movie's tvSeriesName must have a length of at least 1 letter, but is ${tvSeriesName.length}!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  // *** episodeNo ************************************************************

  /**
   * @returns {number} the number of the episode
   */
  get episodeNo() {
    return this._episodeNo;
  }

  /**
   * sets a new episodeNo
   * @param {number | string} episodeNo
   */
  set episodeNo(episodeNo) {
    const validationResult = Movie.checkEpisodeNo(episodeNo, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._episodeNo = parseStringInteger(episodeNo);
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given episodeNo is present and > 0
   * @param {number | string} episodeNo
   * @param {number} movieCategory
   * @returns a ConstraintViolation
   */
  static checkEpisodeNo(episodeNo, movieCategory) {
    const category = parseStringInteger(movieCategory);
    if (category === MovieCategoryEL["TvSeriesEpisode"] && !episodeNo) {
      return new MandatoryValueConstraintViolation(
        "A TvSeriesEpisode must have a 'episodeNo' field!"
      );
    } else if (category !== MovieCategoryEL["TvSeriesEpisode"] && episodeNo) {
      return new ConstraintViolation(
        "An 'episodeNo' field value must not " +
          "be provided if the movie is not a TvSeriesEpisode!"
      );
    } else if (!isIntegerOrIntegerString(episodeNo)) {
      return new RangeConstraintViolation(
        `The tvSeriesEpisode's episodeNo must be an Integer, but is (${episodeNo}: ${typeof episodeNo})!`
      );
    } else if (parseStringInteger(episodeNo) < 0) {
      return new IntervalConstraintViolation(
        `The tvSeriesEpisode's episodeNo must be larger than 0, but is ${episodeNo}!`
      );
    } else {
      return new NoConstraintViolation();
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
    switch (this.category) {
      case MovieCategoryEL["BIOGRAPHY"]:
        return movieStr + `, biography about: ${this._about.toString()}`;
      case MovieCategoryEL["TvSeriesEpisode"]:
        return (
          movieStr +
          `, episode: ${this.episodeNo}, tv series: ${this.tvSeriesName}`
        );
      default:
        return movieStr + `}`;
    }
  }
}
