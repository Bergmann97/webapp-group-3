import {
  createListFromMap,
  createMultipleChoiceWidget,
  fillSelectWithOptions,
} from "../../lib/util.js";
import { Movie, MovieCategoryEL } from "../m/Movie.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";
import { displaySegmentFields, undisplayAllSegmentFields } from "../c/app.js";

/******************************************************************************
 *** MOVIE UI *****************************************************************
 *****************************************************************************/

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
    createMovieIdInput.value = MovieStorage.nextId().toString();
  });
}

// save data when leaving the page
window.addEventListener("beforeunload", () => {
  MovieStorage.persist();
  PersonStorage.persist();
});

function refreshManageDataUI() {
  // show the manage book UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

/**
 * event handler for book category selection events
 * used both in create and update
 *
 * @param {Event} e
 */
function handleCategorySelectChangeEvent(e) {
  /** @ts-ignore @type {HTMLFormElement} */
  const formEl = e.currentTarget.form;
  /** @type {string} the array index of MovieCategoryEL.labels */
  const categoryIndexStr = formEl.selectCategory.value;
  if (categoryIndexStr) {
    displaySegmentFields(
      formEl,
      MovieCategoryEL.labels,
      parseInt(categoryIndexStr)
    );
  } else {
    undisplayAllSegmentFields(formEl, MovieCategoryEL.labels);
  }
}

// Set up Manage Book UI
refreshManageDataUI();

// loading the data
PersonStorage.retrieveAll();
MovieStorage.retrieveAll();

/******************************************************************************
 *** RETRIEVE AND LIST ********************************************************
 *****************************************************************************/

document.getElementById("retrieveAndListAll").addEventListener("click", () => {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "block";

  /** @type {HTMLTableSectionElement} */
  const movieTable = document.querySelector("section#Movie-R > table > tbody");
  movieTable.innerHTML = ""; // drop old content
  for (const key of Object.keys(MovieStorage.instances)) {
    /** @type {Movie} */
    const movie = MovieStorage.instances[key];
    const row = movieTable.insertRow();
    row.insertCell().textContent = movie.movieId.toString();
    row.insertCell().textContent = movie.title;
    if (movie.releaseDate) {
      row.insertCell().textContent = movie.releaseDate.toDateString();
    } else {
      row.insertCell().textContent = "unknown";
    }
    row.insertCell().textContent =
      movie.director.name + " (ID:" + movie.director.personId + ")";
    const actorsList = createListFromMap(movie.actors, "name");
    if (actorsList.childElementCount > 0) {
      row.insertCell().appendChild(actorsList);
    } else {
      row.insertCell().textContent = "no actors";
    }
    if (movie.category) {
      switch (movie.category) {
        case MovieCategoryEL["BIOGRAPHY"]:
          row.insertCell().textContent = `Biography about ${movie.about.name}`;
          break;
        case MovieCategoryEL["TVSERIESEPISODE"]:
          row.insertCell().textContent = `Episode ${movie.episodeNo} of TV series "${movie.tvSeriesName}"`;
          break;
      }
    }
  }
});

/******************************************************************************
 *** CREATE *******************************************************************
 *****************************************************************************/

/** # FORM
 * @type {HTMLFormElement} */
const createMovieForm = document.querySelector("section#Movie-C > form");
document.getElementById("create").addEventListener("click", () => {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";

  undisplayAllSegmentFields(createMovieForm, MovieCategoryEL.labels);

  fillSelectWithOptions(
    createDirectorSelection,
    PersonStorage.instances,
    "name"
  );
  fillSelectWithOptions(createActorsSelection, PersonStorage.instances, "name");
  fillSelectWithOptions(createAboutSelection, PersonStorage.instances, "name");
});

/** ### MOVIE_ID ----------------------------------------------------
 * @type {HTMLInputElement} */
const createMovieIdInput = createMovieForm["movieId"];
createMovieIdInput.addEventListener("input", () => {
  createMovieIdInput.setCustomValidity(
    Movie.checkMovieId(createMovieIdInput.value).message
  );
});
createMovieIdInput.value = MovieStorage.nextId().toString(); // initially the next free id

/** ### TITLE -------------------------------------------------------
 * @type {HTMLInputElement} */
const createTitleInput = createMovieForm["movieTitle"];
createTitleInput.addEventListener("input", () => {
  createTitleInput.setCustomValidity(
    Movie.checkTitle(createTitleInput.value).message
  );
});

/** ### RELEASE_DATE ------------------------------------------------
 * @type {HTMLInputElement} */
const createReleaseDateInput = createMovieForm["releaseDate"];
createReleaseDateInput.addEventListener("input", () => {
  createReleaseDateInput.setCustomValidity(
    Movie.checkReleaseDate(createReleaseDateInput.value).message
  );
});

/** ### DIRECTOR ----------------------------------------------------
 * @type {HTMLSelectElement} */
const createDirectorSelection = createMovieForm["selectDirector"];
createDirectorSelection.addEventListener("change", () => {
  createDirectorSelection.setCustomValidity(
    Movie.checkDirector(createDirectorSelection.value).message
  );
});

/** ### ACTORS ------------------------------------------------------
 * @type {HTMLSelectElement} */
const createActorsSelection = createMovieForm["selectActors"];

/** ### CATEGORY ----------------------------------------------------
 * @type {HTMLSelectElement} */
const createCategorySelection = createMovieForm["selectCategory"];
fillSelectWithOptions(createCategorySelection, MovieCategoryEL.labels);
createCategorySelection.addEventListener(
  "change",
  handleCategorySelectChangeEvent
);

/** ### ABOUT -------------------------------------------------------
 * @type {HTMLSelectElement} */
const createAboutSelection = createMovieForm["selectAbout"];

/** ### TV_SERIES_NAME ----------------------------------------------
 * @type {HTMLInputElement} */
const createTvSeriesNameInput = createMovieForm["tvSeriesName"];

/** ### EPISODE_NO ----------------------------------------------------
 * @type {HTMLInputElement} */
const createEpisodeNoInput = createMovieForm["episodeNo"];

/** ### SAVE_BUTTON -------------------------------------------------
 * @type {HTMLButtonElement} */
const createButton = createMovieForm["create"];
createButton.addEventListener("click", () => {
  /** @type {import("../m/Movie.js").MovieSlots} */
  const slots = {
    movieId: createMovieIdInput.value,
    title: createTitleInput.value,
    releaseDate: createReleaseDateInput.value,
    director: createDirectorSelection.value,
    actors: [],
  };

  // check all input fields and show error messages
  createMovieIdInput.setCustomValidity(
    Movie.checkMovieId(slots.movieId).message
  );
  createTitleInput.setCustomValidity(
    Movie.checkTitle(createTitleInput.value).message
  );
  createReleaseDateInput.setCustomValidity(
    Movie.checkReleaseDate(createReleaseDateInput.value).message
  );
  createDirectorSelection.setCustomValidity(
    Movie.checkDirector(createDirectorSelection.value).message
  );

  // category
  if (createCategorySelection.value) {
    slots.category = parseInt(createCategorySelection.value);
    switch (slots.category) {
      case MovieCategoryEL["BIOGRAPHY"]:
        slots.about = createAboutSelection.value;
        createAboutSelection.setCustomValidity(
          Movie.checkAbout(createAboutSelection.value, slots.category).message
        );
        break;
      case MovieCategoryEL["TVSERIESEPISODE"]:
        slots.episodeNo = createEpisodeNoInput.value;
        slots.tvSeriesName = createTvSeriesNameInput.value;
        createEpisodeNoInput.setCustomValidity(
          Movie.checkEpisodeNo(createEpisodeNoInput.value, slots.category)
            .message
        );
        createTvSeriesNameInput.setCustomValidity(
          Movie.checkTvSeriesName(createTvSeriesNameInput.value, slots.category)
            .message
        );
        break;
    }
  }

  // actors + creation
  const selActOptions = createActorsSelection.selectedOptions;

  // save the input data only if all form fields are valid
  if (createMovieForm.checkValidity()) {
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

/** # FORM
 * @type {HTMLFormElement} */
const updateMovieForm = document.querySelector("section#Movie-U > form");
undisplayAllSegmentFields(updateMovieForm, MovieCategoryEL.labels);
document.getElementById("update").addEventListener("click", () => {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";

  fillSelectWithOptions(updateMovieSelection, MovieStorage.instances, "title");
  updateMovieForm.reset();
});

/** ### MOVIE_SELECTION ---------------------------------------------
 * @type {HTMLSelectElement} */
const updateMovieSelection = updateMovieForm["selectMovie"];
updateMovieSelection.addEventListener("change", () => {
  const movieId = updateMovieSelection.value;

  if (movieId) {
    const movie = MovieStorage.instances[movieId];
    updateMovieIdOutput.value = movie.movieId.toString();
    updateTitleInput.value = movie.title;
    updateReleaseDateInput.valueAsDate = movie.releaseDate;

    // set up the associated publisher selection list
    fillSelectWithOptions(
      updateDirectorSelection,
      PersonStorage.instances,
      "name"
    );

    // set up the associated authors selection widget
    createMultipleChoiceWidget(
      updateActorsSelection,
      movie.actors,
      PersonStorage.instances,
      "personId",
      "name",
      1
    );

    fillSelectWithOptions(
      updateAboutSelection,
      PersonStorage.instances,
      "name"
    );

    updateDirectorSelection.selectedIndex = movie.director.personId;

    if (movie.category) {
      updateCategorySelection.selectedIndex = movie.category;
      updateCategorySelection.disabled = true;
      displaySegmentFields(
        updateMovieForm,
        MovieCategoryEL.labels,
        movie.category
      );

      switch (movie.category) {
        case MovieCategoryEL["BIOGRAPHY"]:
          updateAboutSelection.selectedIndex = movie.about.personId;
          updateTvSeriesNameInput.value = "";
          updateEpisodeNoInput.value = "";
          break;
        case MovieCategoryEL["TVSERIESEPISODE"]:
          updateAboutSelection.selectedIndex = 0;
          updateTvSeriesNameInput.value = movie.tvSeriesName;
          updateEpisodeNoInput.value = movie.episodeNo.toString();
          break;
      }
    } else {
      updateCategorySelection.selectedIndex = 0;
      updateCategorySelection.disabled = false;
      updateAboutSelection.selectedIndex = 0;
      updateTvSeriesNameInput.value = "";
      updateEpisodeNoInput.value = "";
      undisplayAllSegmentFields(updateMovieForm, MovieCategoryEL.labels);
    }

    updateButton.disabled = false;
  } else {
    updateMovieForm.reset();
    updateButton.disabled = true;
  }
});

/** ### MOVIE_ID ----------------------------------------------------
 * @type {HTMLOutputElement} */
const updateMovieIdOutput = updateMovieForm["movieId"];

/** ### TITLE -------------------------------------------------------
 * @type {HTMLInputElement} */
const updateTitleInput = updateMovieForm["movieTitle"];
updateTitleInput.addEventListener("input", () => {
  updateTitleInput.setCustomValidity(
    Movie.checkTitle(updateTitleInput.value).message
  );
});

/** ### RELEASE_DATE ------------------------------------------------
 * @type {HTMLInputElement} */
const updateReleaseDateInput = updateMovieForm["releaseDate"];
updateReleaseDateInput.addEventListener("input", () => {
  updateReleaseDateInput.setCustomValidity(
    Movie.checkReleaseDate(updateReleaseDateInput.value).message
  );
});

/** ### DIRECTOR ----------------------------------------------------
 * @type {HTMLSelectElement} */
const updateDirectorSelection = updateMovieForm["director"];
updateDirectorSelection.addEventListener("change", () => {
  updateDirectorSelection.setCustomValidity(
    Movie.checkDirector(updateDirectorSelection.value).message
  );
});

/** ### ACTORS ------------------------------------------------------
 * @type {HTMLSelectElement} */
const updateActorsSelection =
  updateMovieForm.querySelector(".MultiChoiceWidget");

/** ### CATEGORY ----------------------------------------------------
 * @type {HTMLSelectElement} */
const updateCategorySelection = updateMovieForm["selectCategory"];
fillSelectWithOptions(updateCategorySelection, MovieCategoryEL.labels);
updateCategorySelection.addEventListener(
  "change",
  handleCategorySelectChangeEvent
);

/** ### ABOUT -------------------------------------------------------
 * @type {HTMLSelectElement} */
const updateAboutSelection = updateMovieForm["selectAbout"];
updateAboutSelection.addEventListener("input", function () {
  updateAboutSelection.setCustomValidity(
    Movie.checkAbout(
      updateAboutSelection.value,
      parseInt(updateCategorySelection.value)
    ).message
  );
});

/** ### TV_SERIES_NAME ----------------------------------------------
 * @type {HTMLInputElement} */
const updateTvSeriesNameInput = updateMovieForm["tvSeriesName"];
updateTvSeriesNameInput.addEventListener("input", function () {
  updateTvSeriesNameInput.setCustomValidity(
    Movie.checkTvSeriesName(
      updateTvSeriesNameInput.value,
      parseInt(updateCategorySelection.value)
    ).message
  );
});

/** ### EPISODE_NO ----------------------------------------------------
 * @type {HTMLInputElement} */
const updateEpisodeNoInput = updateMovieForm["episodeNo"];
updateEpisodeNoInput.addEventListener("input", function () {
  updateEpisodeNoInput.setCustomValidity(
    Movie.checkEpisodeNo(
      updateEpisodeNoInput.value,
      parseInt(updateCategorySelection.value)
    ).message
  );
});

/** ### SAVE_BUTTON -------------------------------------------------
 * @type {HTMLButtonElement} */
const updateButton = updateMovieForm["update"];
updateButton.addEventListener("click", () => {
  const multiChoiceListEl = updateActorsSelection.firstElementChild;
  /** @type {{movieId: number | string} & import("../m/MovieStorage.js").MovieUpdateSlots} */
  const slots = {
    movieId: updateMovieIdOutput.value,
    title: updateTitleInput.value,
    releaseDate: updateReleaseDateInput.value,
    director: updateDirectorSelection.value,
    actorsToAdd: [],
    actorsToRemove: [],
  };

  // check all input fields and show error messages
  updateTitleInput.setCustomValidity(
    Movie.checkTitle(updateTitleInput.value).message
  );
  updateReleaseDateInput.setCustomValidity(
    Movie.checkReleaseDate(updateReleaseDateInput.value).message
  );
  updateDirectorSelection.setCustomValidity(
    Movie.checkDirector(updateDirectorSelection.value).message
  );

  // category
  if (updateCategorySelection.value) {
    slots.category = parseInt(updateCategorySelection.value);
    switch (slots.category) {
      case MovieCategoryEL["BIOGRAPHY"]:
        slots.about = updateAboutSelection.value;
        updateAboutSelection.setCustomValidity(
          Movie.checkAbout(updateAboutSelection.value, slots.category).message
        );
        break;
      case MovieCategoryEL["TVSERIESEPISODE"]:
        slots.episodeNo = updateEpisodeNoInput.value;
        slots.tvSeriesName = updateTvSeriesNameInput.value;
        updateEpisodeNoInput.setCustomValidity(
          Movie.checkEpisodeNo(updateEpisodeNoInput.value, slots.category)
            .message
        );
        updateTvSeriesNameInput.setCustomValidity(
          Movie.checkTvSeriesName(updateTvSeriesNameInput.value, slots.category)
            .message
        );
        break;
    }
  }

  // save the input data only if all form fields are valid
  if (updateMovieForm.checkValidity()) {
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
    updateMovieSelection.options[updateMovieSelection.selectedIndex].text =
      slots.title;
    updateActorsSelection.innerHTML = "";
  }
});

/******************************************************************************
 *** DELETE *******************************************************************
 *****************************************************************************/

/** # FROM
 * @type {HTMLFormElement} */
const deleteMovieForm = document.querySelector("section#Movie-D > form");
document.getElementById("destroy").addEventListener("click", () => {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-D").style.display = "block";

  fillSelectWithOptions(deleteMovieSelection, MovieStorage.instances, "title");
  deleteMovieForm.reset();
});

/** # MOVIE_SELECTION
 * @type {HTMLSelectElement} */
const deleteMovieSelection = deleteMovieForm["selectMovie"];

/** ### SAVE_BUTTON -------------------------------------------------
 * @type {HTMLButtonElement} */
const deleteButton = deleteMovieForm["delete"];
deleteButton.addEventListener("click", () => {
  const movieId = deleteMovieSelection.value;
  if (!movieId) return;
  if (confirm("Do you really want to delete this Movie?")) {
    MovieStorage.destroy(movieId);

    // remove deleted book from select options
    deleteMovieSelection.remove(deleteMovieSelection.selectedIndex);
  }
});
