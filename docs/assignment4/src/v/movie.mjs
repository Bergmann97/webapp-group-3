import {
  createListFromMap,
  createMultipleChoiceWidget,
  fillSelectWithOptions,
} from "../../lib/util.js";
import { Movie } from "../m/Movie.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

// loading the data
PersonStorage.retrieveAll();
MovieStorage.retrieveAll();

// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", () => {
    refreshManageDataUI();
    document
      .querySelector("section#Movie-U > form")
      .querySelector(".MultiChoiceWidget").innerHTML = "";
  });
}

// neutralize the submit event for all CRUD UIs (The double selector is for correct typing)
for (const frm of document.querySelector("section").querySelectorAll("form")) {
  frm.addEventListener("submit", (e) => {
    e.preventDefault();
    frm.reset();
  });
}

// save data when leaving the page
window.addEventListener("beforeunload", () => {
  MovieStorage.persist();
});

/******************************************************************************
 *** RETRIEVE AND LIST ********************************************************
 *****************************************************************************/

document.getElementById("retrieveAndListAll").addEventListener("click", () => {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "block";

  /** @type {HTMLTableSectionElement} */
  const tableBodyEl = document.querySelector("section#Movie-R > table > tbody");
  tableBodyEl.innerHTML = ""; // drop old content
  for (const key of Object.keys(MovieStorage.instances)) {
    /** @type {Movie} */
    const movie = MovieStorage.instances[key];
    const actorsListEl = createListFromMap(movie.actors, "name");
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = movie.movieId.toString();
    row.insertCell().textContent = movie.title;
    if (movie.releaseDate) {
      row.insertCell().textContent = movie.releaseDate.toDateString();
    } else {
      row.insertCell().textContent = "";
    }
    row.insertCell().textContent =
      movie.director.name + " (ID:" + movie.director.personId + ")";
    if (actorsListEl) {
      row.insertCell().appendChild(actorsListEl);
    } else {
      row.insertCell().textContent = "";
    }
  }
});

/******************************************************************************
 *** CREATE *******************************************************************
 *****************************************************************************/

/** @type {HTMLFormElement} */
const createMovieFormEl = document.querySelector("section#Movie-C > form");
/** @type {HTMLInputElement} */
const createMovieIdEl = createMovieFormEl["movieId"];
/** @type {HTMLInputElement} */
const createTitleEl = createMovieFormEl["movieTitle"];
/** @type {HTMLInputElement} */
const createReleaseDateEl = createMovieFormEl["releaseDate"];
/** @type {HTMLSelectElement} */
const selectDirectorEl = createMovieFormEl["selectDirector"];
/** @type {HTMLSelectElement} */
const selectActorsEl = createMovieFormEl["selectActors"];
document.getElementById("create").addEventListener("click", () => {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";

  fillSelectWithOptions(selectDirectorEl, PersonStorage.instances, "name");
  fillSelectWithOptions(selectActorsEl, PersonStorage.instances, "name");

  createMovieFormEl.reset();
});

// check on input/change
createMovieIdEl.addEventListener("input", () => {
  createMovieIdEl.setCustomValidity(
    Movie.checkMovieId(createMovieIdEl.value).message
  );
});
createTitleEl.addEventListener("input", () => {
  createTitleEl.setCustomValidity(
    Movie.checkTitle(createTitleEl.value).message
  );
});
createReleaseDateEl.addEventListener("input", () => {
  createReleaseDateEl.setCustomValidity(
    Movie.checkReleaseDate(createReleaseDateEl.value).message
  );
});
selectDirectorEl.addEventListener("change", () => {
  selectDirectorEl.setCustomValidity(
    Movie.checkDirector(selectDirectorEl.value).message
  );
});

// handle save button click
createMovieFormEl["commit"].addEventListener("click", () => {
  /** @type {import("../m/Movie.js").MovieSlots} */
  const slots = {
    movieId: createMovieIdEl.value,
    title: createTitleEl.value,
    releaseDate: createReleaseDateEl.value,
    director: selectDirectorEl.value,
    actors: [],
  };

  // check all input fields and show error messages
  createMovieIdEl.setCustomValidity(Movie.checkMovieId(slots.movieId).message);
  createTitleEl.setCustomValidity(
    Movie.checkTitle(createTitleEl.value).message
  );
  selectDirectorEl.setCustomValidity(
    Movie.checkDirector(selectDirectorEl.value).message
  );

  const selActOptions = selectActorsEl.selectedOptions;

  // save the input data only if all form fields are valid
  if (createMovieFormEl.checkValidity()) {
    // construct a list of author ID references
    for (const opt of selActOptions) {
      // @ts-ignore this is an array for sure !
      slots.actors.push(opt.value);
    }
    MovieStorage.add(slots);
  }
});

/******************************************************************************
 *** UPDATE *******************************************************************
 *****************************************************************************/

/** @type {HTMLFormElement} */
const updateMovieFormEl = document.querySelector("section#Movie-U > form");
/** @type {HTMLSelectElement} */
const selectMovieEl = updateMovieFormEl["selectMovie"];
/** @type {HTMLInputElement} */
const movieIdEl = updateMovieFormEl["movieId"];
/** @type {HTMLInputElement} */
const updateTitleEl = updateMovieFormEl["movieTitle"];
/** @type {HTMLInputElement} */
const updateReleaseDateEl = updateMovieFormEl["releaseDate"];
/** @type {HTMLSelectElement} */
const updateSelDirectorEl = updateMovieFormEl["director"];
/** @type {HTMLSelectElement} */
const updateSelActorsEl = updateMovieFormEl.querySelector(".MultiChoiceWidget");
document.getElementById("update").addEventListener("click", () => {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";

  fillSelectWithOptions(selectMovieEl, MovieStorage.instances, "title");
  updateMovieFormEl.reset();
});
selectMovieEl.addEventListener("change", () => {
  const saveBtn = updateMovieFormEl.commit,
    movieId = selectMovieEl.value;

  if (movieId) {
    const movie = MovieStorage.instances[movieId];
    movieIdEl.value = movie.movieId;
    updateTitleEl.value = movie.title;
    updateReleaseDateEl.valueAsDate = movie.releaseDate;

    // set up the associated publisher selection list
    fillSelectWithOptions(updateSelDirectorEl, PersonStorage.instances, "name");

    // set up the associated authors selection widget
    createMultipleChoiceWidget(
      updateSelActorsEl,
      movie.actors,
      PersonStorage.instances,
      "personId",
      "name",
      1
    );

    updateSelDirectorEl.selectedIndex = movie.director.personId;

    saveBtn.disabled = false;
  } else {
    updateMovieFormEl.reset();
    saveBtn.disabled = true;
  }
});

// validate on input
updateSelDirectorEl.addEventListener("change", () => {
  updateSelDirectorEl.setCustomValidity(
    Movie.checkDirector(updateSelDirectorEl.value).message
  );
});
updateTitleEl.addEventListener("input", () => {
  updateTitleEl.setCustomValidity(
    Movie.checkTitle(updateTitleEl.value).message
  );
});
updateReleaseDateEl.addEventListener("input", () => {
  updateReleaseDateEl.setCustomValidity(
    Movie.checkReleaseDate(updateReleaseDateEl.value).message
  );
});

// handle save button click incl. handle multiChoice Widget
updateMovieFormEl["commit"].addEventListener("click", () => {
  const multiChoiceListEl = updateSelActorsEl.firstElementChild;
  /** @type {{movieId: number | string} & import("../m/MovieStorage.js").MovieUpdateSlots} */
  const slots = {
    movieId: movieIdEl.value,
    title: updateTitleEl.value,
    releaseDate: updateReleaseDateEl.value,
    director: updateSelDirectorEl.value,
    actorsToAdd: [],
    actorsToRemove: [],
  };

  // check all input fields and show error messages
  updateTitleEl.setCustomValidity(
    Movie.checkTitle(updateTitleEl.value).message
  );
  updateReleaseDateEl.setCustomValidity(
    Movie.checkReleaseDate(updateReleaseDateEl.value).message
  );
  updateSelDirectorEl.setCustomValidity(
    Movie.checkDirector(updateSelDirectorEl.value).message
  );

  // save the input data only if all form fields are valid
  if (updateMovieFormEl.checkValidity()) {
    // construct authorIdRefs-ToAdd/ToRemove lists from the association list
    /** @type {string[]} */
    const actorsToAdd = [];
    /** @type {string[]} */
    const actorsToRemove = [];
    for (const mcListItemEl of multiChoiceListEl.children) {
      if (mcListItemEl.classList.contains("removed")) {
        actorsToRemove.push(mcListItemEl.getAttribute("data-value"));
      }
      if (mcListItemEl.classList.contains("added")) {
        actorsToAdd.push(mcListItemEl.getAttribute("data-value"));
      }
    }

    // if the add/remove list is non-empty create a corresponding slot
    if (actorsToRemove.length > 0) {
      slots.actorsToRemove = actorsToRemove;
    }
    if (actorsToAdd.length > 0) {
      slots.actorsToAdd = actorsToAdd;
    }
    MovieStorage.update(slots);

    // update the book selection list's option element
    selectMovieEl.options[selectMovieEl.selectedIndex].text = slots.title;
    updateSelActorsEl.innerHTML = "";
  }
});

/******************************************************************************
 *** DELETE *******************************************************************
 *****************************************************************************/

/** @type {HTMLFormElement} */
const deleteMovieFormEl = document.querySelector("section#Movie-D > form");
/** @type {HTMLSelectElement} */
const deleteSelectMovieEl = deleteMovieFormEl.selectMovie;
document.getElementById("destroy").addEventListener("click", () => {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-D").style.display = "block";

  fillSelectWithOptions(deleteSelectMovieEl, MovieStorage.instances, "title");
  deleteMovieFormEl.reset();
});
deleteMovieFormEl["commit"].addEventListener("click", () => {
  const movieId = deleteSelectMovieEl.value;
  if (!movieId) return;
  if (confirm("Do you really want to delete this Movie?")) {
    MovieStorage.destroy(movieId);

    // remove deleted book from select options
    deleteSelectMovieEl.remove(deleteSelectMovieEl.selectedIndex);
  }
});

function refreshManageDataUI() {
  // show the manage book UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

// Set up Manage Book UI
refreshManageDataUI();
