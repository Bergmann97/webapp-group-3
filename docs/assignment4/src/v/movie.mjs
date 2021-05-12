import { Movie } from "../m/Movie.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";
import { fillSelectWithOptions, createListFromMap, createMultipleChoiceWidget }
    from "../../lib/util.js";

// loading the data
PersonStorage.retrieveAll();
MovieStorage.retrieveAll();

// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
    btn.addEventListener( "click", function () {
      refreshManageDataUI();
      document.querySelector("section#Movie-U > form").querySelector(".MultiChoiceWidget").innerHTML = "";
    });
}
// neutralize the submit event for all CRUD UIs
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}

// save data when leaving the page
// window.addEventListener("beforeunload", MovieStorage.persist);

window.addEventListener( "beforeunload", function () {
  MovieStorage.persist();
})

// ------- RETRIEVE AND LIST ALL -------
document.getElementById("retrieveAndListAll").addEventListener(
  "click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-R").style.display = "block";

    const tableBodyEl = document.
      querySelector("section#Movie-R > table > tbody");
    tableBodyEl.innerHTML = "";  // drop old content
    for (const key of Object.keys( MovieStorage.instances)) {
        const movie = MovieStorage.instances[key];
        const actorsListEl = createListFromMap( movie.actors, "name");
        const row = tableBodyEl.insertRow();
        row.insertCell().textContent = movie.movieId;
        row.insertCell().textContent = movie.title;
        if (movie.releaseDate) {
          row.insertCell().textContent = movie.releaseDate.toDateString();
        } else {
          row.insertCell().textContent = "";
        }
        row.insertCell().textContent = movie.director.name + " (ID:" +  movie.director.personId + ")";
        if (actorsListEl) {
          row.insertCell().appendChild( actorsListEl);
        } else {
          row.insertCell().textContent = "";
        }
    }
});

// ------- CREATE -------
const createMovieFormEl = document.querySelector("section#Movie-C > form"),
      createMovieIdEl = createMovieFormEl.movieId,
      createTitleEl = createMovieFormEl.title,
      createReleaseDateEl = createMovieFormEl.releaseDate,
      selectDirectorEl = createMovieFormEl.selectDirector,
      selectActorsEl = createMovieFormEl.selectActors;
document.getElementById("create").addEventListener(
  "click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-C").style.display = "block";

    fillSelectWithOptions( selectDirectorEl, PersonStorage.instances, "name");
    fillSelectWithOptions( selectActorsEl, PersonStorage.instances, "name");

    createMovieFormEl.reset();
});
// check on input/change
createMovieIdEl.addEventListener("input", function () {
  createMovieIdEl.setCustomValidity(
    Movie.checkMovieId( createMovieIdEl.value).message);
});
createTitleEl.addEventListener("input", function () {
  createTitleEl.setCustomValidity(
    Movie.checkTitle( createTitleEl.value).message)
});
createReleaseDateEl.addEventListener("input", function () {
  createReleaseDateEl.setCustomValidity(
    Movie.checkReleaseDate( createReleaseDateEl.value).message)
});
selectDirectorEl.addEventListener("change", function () {
  selectDirectorEl.setCustomValidity(
    Movie.checkDirector( selectDirectorEl.value).message)
});
// handle save button click
createMovieFormEl["commit"].addEventListener("click", function () {
  const slots = {
    movieId: createMovieIdEl.value,
    title: createTitleEl.value,
    releaseDate: createReleaseDateEl.value,
    director: selectDirectorEl.value,
    actorsIdRefs: []
  };
  // check all input fields and show error messages
  createMovieIdEl.setCustomValidity(
      Movie.checkMovieId( slots.movieId).message);
  createTitleEl.setCustomValidity(
    Movie.checkTitle(createTitleEl.value).message);
  selectDirectorEl.setCustomValidity(
    Movie.checkDirector( selectDirectorEl.value).message);

  const selActOptions = selectActorsEl.selectedOptions;
  // save the input data only if all form fields are valid
  if (createMovieFormEl.checkValidity()) {
    // construct a list of author ID references
    for (const opt of selActOptions) {
      slots.actorsIdRefs.push( opt.value);
    }
    MovieStorage.add( slots);
  }
});

// ------- UPDATE -------
const updateMovieFormEl = document.querySelector("section#Movie-U > form"),
      selectMovieEl = updateMovieFormEl.selectMovie,
      updateTitleEl = updateMovieFormEl.title,
      updateReleaseDateEl = updateMovieFormEl.releaseDate,
      updateSelDirectorEl = updateMovieFormEl.director,
      updateSelActorsEl = updateMovieFormEl.querySelector(".MultiChoiceWidget");
document.getElementById("update").addEventListener(
  "click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-U").style.display = "block";

    fillSelectWithOptions( selectMovieEl, MovieStorage.instances,
      "title");
    updateMovieFormEl.reset();
});
selectMovieEl.addEventListener("change", function () {
    const saveBtn = updateMovieFormEl.commit,
          movieId = selectMovieEl.value;
  
  if (movieId) {
    const movie = MovieStorage.instances[movieId];
    updateMovieFormEl.movieid.value = movie.movieId;
    updateTitleEl.value = movie.title;
    updateReleaseDateEl.valueAsDate = movie.releaseDate;

    // set up the associated publisher selection list
    fillSelectWithOptions( updateSelDirectorEl, PersonStorage.instances, "name");
    // set up the associated authors selection widget
    createMultipleChoiceWidget( updateSelActorsEl, movie.actors,
        PersonStorage.instances, "personId", "name", 1); 

    updateSelDirectorEl.selectedIndex = movie.director.personId;

    saveBtn.disabled = false;
  } else {
    updateMovieFormEl.reset();
    saveBtn.disabled = true;
  }
});

// validate on input 
updateSelDirectorEl.addEventListener("change", function () {
  updateSelDirectorEl.setCustomValidity(
    Movie.checkDirector( updateSelDirectorEl.value).message);
});
updateTitleEl.addEventListener("input", function () {
  updateTitleEl.setCustomValidity(
    Movie.checkTitle( updateTitleEl.value).message);
});
updateReleaseDateEl.addEventListener("input", function () {
  updateReleaseDateEl.setCustomValidity(
    Movie.checkReleaseDate( updateReleaseDateEl.value).message);
});

// handle save button click incl. handle multiChoice Widget
updateMovieFormEl["commit"].addEventListener("click", function () {
  const multiChoiceListEl = updateSelActorsEl.firstElementChild;
  const slots = {
    movieId: updateMovieFormEl.movieid.value,
    title: updateTitleEl.value,
    releaseDate: updateReleaseDateEl.value,
    director: updateSelDirectorEl.value,
    actorsIdRefsToAdd: [],
    actorsIdRefsToRemove: []
  };
  // check all input fields and show error messages
  updateTitleEl.setCustomValidity(
    Movie.checkTitle(updateTitleEl.value).message);
  updateReleaseDateEl.setCustomValidity(
    Movie.checkReleaseDate(updateReleaseDateEl.value).message);
  updateSelDirectorEl.setCustomValidity(
    Movie.checkDirector( updateSelDirectorEl.value).message);

  // save the input data only if all form fields are valid
  if (updateMovieFormEl.checkValidity()) {
    // construct authorIdRefs-ToAdd/ToRemove lists from the association list
    const actorsIdRefsToAdd = [], actorsIdRefsToRemove = [];
    for (const mcListItemEl of multiChoiceListEl.children) {
      if (mcListItemEl.classList.contains("removed")) {
        actorsIdRefsToRemove.push( mcListItemEl.getAttribute("data-value"));
      }
      if (mcListItemEl.classList.contains("added")) {
        actorsIdRefsToAdd.push( mcListItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty create a corresponding slot
    if (actorsIdRefsToRemove.length > 0) {
      slots.actorsIdRefsToRemove = actorsIdRefsToRemove;
    }
    if (actorsIdRefsToAdd.length > 0) {
      slots.actorsIdRefsToAdd = actorsIdRefsToAdd;
    }
    MovieStorage.update( slots);
    // update the book selection list's option element
    selectMovieEl.options[selectMovieEl.selectedIndex].text = slots.title;
    updateSelActorsEl.innerHTML = "";
  }
});

// ------- DELETE -------
const deleteMovieFormEl = document.querySelector("section#Movie-D > form"),
      deleteSelectMovieEl = deleteMovieFormEl.selectMovie;
document.getElementById("destroy").addEventListener(
  "click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-D").style.display = "block";

    fillSelectWithOptions( deleteSelectMovieEl, MovieStorage.instances,
      "title");
      deleteMovieFormEl.reset();
});
deleteMovieFormEl["commit"].addEventListener("click", function () {
  const movieid = deleteSelectMovieEl.value;
  if (!movieid) return;
  if (confirm("Do you really want to delete this Movie?")) {
    MovieStorage.destroy(movieid);
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