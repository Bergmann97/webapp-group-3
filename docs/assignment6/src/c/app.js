import { MovieCategoryEL } from "../m/Movie.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

/**
 *  Create and save test data
 */
export function generateTestData() {
  try {
    // add persons
    PersonStorage.add({
      personId: 16,
      name: "John Doe",
    });
    PersonStorage.add({
      personId: 17,
      name: "Jane Doe",
    });
    PersonStorage.add({
      personId: 1,
      name: "Stephen Frears",
    });
    PersonStorage.add({
      personId: 2,
      name: "George Lucas",
    });
    PersonStorage.add({
      personId: 3,
      name: "Quentin Terrentino",
    });
    PersonStorage.add({
      personId: 4,
      name: "Uma Thurman",
    });
    PersonStorage.add({
      personId: 5,
      name: "John Travolta",
    });
    PersonStorage.add({
      personId: 6,
      name: "Ewan McGregor",
    });
    PersonStorage.add({
      personId: 7,
      name: "Natalie Portman",
    });
    PersonStorage.add({
      personId: 8,
      name: "Keanu Reeves",
    });
    PersonStorage.add({
      personId: 9,
      name: "Russell Crowe",
    });
    PersonStorage.add({
      personId: 10,
      name: "Seth MacFarlane",
    });
    PersonStorage.add({
      personId: 11,
      name: "Naomi Watts",
    });
    PersonStorage.add({
      personId: 12,
      name: "Daniel Minahan",
    });
    PersonStorage.add({
      personId: 13,
      name: "Ed Harris",
    });
    PersonStorage.add({
      personId: 14,
      name: "Marc Forster",
    });
    PersonStorage.add({
      personId: 15,
      name: "John Forbes Nash",
    });

    // add agents to persons
    PersonStorage.update({
      personId: 4,
      name: "Uma Thurman",
      agent: 16,
    });
    PersonStorage.update({
      personId: 8,
      name: "Keanu Reeves",
      agent: 17,
    });
    PersonStorage.update({
      personId: 9,
      name: "Russell Crowe",
      agent: 17,
    });
    PersonStorage.update({
      personId: 13,
      name: "Ed Harris",
      agent: 16,
    });
    PersonStorage.persist();

    // add movies
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
