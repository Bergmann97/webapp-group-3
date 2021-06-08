import { MovieCategoryEL } from "../m/Movie.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

/**
 *  Create and save test data
 */
export function generateTestData() {
  try {
    PersonStorage.add({
      personId: 1,
      name: "Stephen Frears",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 2,
      name: "George Lucas",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 3,
      name: "Quentin Terrentino",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 4,
      name: "Uma Thurman",
      categories: [],
      agent: 16,
    });
    PersonStorage.add({
      personId: 5,
      name: "John Travolta",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 6,
      name: "Ewan McGregor",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 7,
      name: "Natalie Portman",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 8,
      name: "Keanu Reeves",
      categories: [],
      agent: 17,
    });
    PersonStorage.add({
      personId: 9,
      name: "Russell Crowe",
      categories: [],
      agent: 17,
    });
    PersonStorage.add({
      personId: 10,
      name: "Seth MacFarlane",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 11,
      name: "Naomi Watts",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 12,
      name: "Daniel Minahan",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 13,
      name: "Ed Harris",
      categories: [],
      agent: 16,
    });
    PersonStorage.add({
      personId: 14,
      name: "Marc Forster",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 15,
      name: "John Forbes Nash",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 16,
      name: "John Doe",
      categories: [],
      agent: null,
    });
    PersonStorage.add({
      personId: 17,
      name: "Jane Doe",
      categories: [],
      agent: null,
    });
    PersonStorage.persist();

    MovieStorage.add({
      movieId: 1,
      title: "Pulp Fiction",
      releaseDate: "1994-05-12",
      director: 3,
      actors: [3, 4, 5],
    });
    MovieStorage.add({
      movieId: 2,
      title: "Star Wars",
      releaseDate: "1977-05-25",
      director: 2,
      actors: [6, 7],
    });
    MovieStorage.add({
      movieId: 3,
      title: "Dangerous Liaisons",
      releaseDate: "1988-12-16",
      director: 1,
      actors: [4, 8],
    });
    MovieStorage.add({
      movieId: 4,
      title: "2015",
      releaseDate: "2019-06-30",
      director: 1,
      actors: [9, 10, 11],
      category: MovieCategoryEL["TVSERIESEPISODE"],
      episodeNo: 6,
      tvSeriesName: "The Loudest Voice",
    });
    MovieStorage.add({
      movieId: 5,
      title: "A Beautiful Mind",
      releaseDate: "2001-12-21",
      director: 9,
      actors: [9, 13],
      category: MovieCategoryEL["BIOGRAPHY"],
      about: 15,
    });
    MovieStorage.add({
      movieId: 6,
      title: "Stay",
      releaseDate: "2005-09-24",
      director: 14,
      actors: [6, 11],
    });
    MovieStorage.persist();
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
export function clearData() {
  if (confirm("Do you really want to delete the entire database?")) {
    try {
      MovieStorage.clear();
      PersonStorage.clear();
      console.log("Database cleared.");
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`);
    }
  }
}

/**
 * Undisplay all form fields classified with a Book segment name
 * from BookCategoryEL.labels
 * @param {any} domNode
 * @param {string[]} segmentNames
 */
export function undisplayAllSegmentFields(domNode, segmentNames) {
  if (!domNode) domNode = document; // normally invoked for a form element
  for (const segmentName of segmentNames) {
    const fields = domNode.getElementsByClassName(segmentName);
    for (const el of fields) {
      el.style.display = "none";
    }
  }
}
/**
 * Display the form fields classified with a Book segment name
 * from BookCategoryEL.labels
 * @param {any} domNode
 * @param {string[]} segmentNames
 * @param {number} segmentIndex
 */
export function displaySegmentFields(domNode, segmentNames, segmentIndex) {
  if (!domNode) domNode = document; // normally invoked for a form element
  for (let i = 0; i < segmentNames.length; i++) {
    const fields = domNode.getElementsByClassName(segmentNames[i]);
    for (const el of fields) {
      el.style.display = i === segmentIndex - 1 ? "block" : "none";
    }
  }
}
