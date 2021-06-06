import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

/**
 *  Create and save test data
 */
function generateTestData() {
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
      agent: null,
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
      agent: null,
    });
    PersonStorage.persist();

    MovieStorage.add({
      movieId: 1,
      title: "Pulp Fiction",
      releaseDate: "1994-05-12",
      director: 3,
      actors: [4, 5],
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
    MovieStorage.persist();
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
function clearData() {
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

export { generateTestData, clearData };
