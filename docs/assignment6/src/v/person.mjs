import { Person } from "../m/Person.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";
import { createListFromMap, fillSelectWithOptions } from "../../lib/util.js";

/******************************************************************************
 *** PERSON UI ****************************************************************
 *****************************************************************************/

// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all CRUD UIs
for (const frm of document.querySelector("section").querySelectorAll("form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
    createPersonIdInput.value = PersonStorage.nextId().toString();
  });
}

// save data when leaving the page
window.addEventListener("beforeunload", () => {
  PersonStorage.persist();
  MovieStorage.persist();
});

function refreshManageDataUI() {
  // show the manage book UI and hide the other UIs
  document.getElementById("Person-M").style.display = "block";
  document.getElementById("Person-R").style.display = "none";
  document.getElementById("Person-C").style.display = "none";
  document.getElementById("Person-U").style.display = "none";
  document.getElementById("Person-D").style.display = "none";
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
  document.getElementById("Person-M").style.display = "none";
  document.getElementById("Person-R").style.display = "block";

  /** @type {HTMLTableSectionElement} */
  const tableBodySelection = document.querySelector(
    "section#Person-R > table > tbody"
  );
  tableBodySelection.innerHTML = ""; // drop old content
  for (const key of Object.keys(PersonStorage.instances)) {
    const person = PersonStorage.instances[key];
    const row = tableBodySelection.insertRow();
    row.insertCell().textContent = person.personId.toString();
    row.insertCell().textContent = person.name;

    // TODO: category
    row.insertCell().textContent = "NYI";

    if (person.agent) {
      row.insertCell().textContent = PersonStorage.instances[person.agent].name;
    } else {
      row.insertCell().textContent = "---";
    }
  }
});

/******************************************************************************
 *** CREATE *******************************************************************
 *****************************************************************************/
/** # FORM
 * @type {HTMLFormElement} */
const createPersonForm = document.querySelector("section#Person-C > form");
document.getElementById("create").addEventListener("click", () => {
  document.getElementById("Person-M").style.display = "none";
  document.getElementById("Person-C").style.display = "block";
  fillSelectWithOptions(
    createPersonAgentSelect,
    PersonStorage.instances,
    "name"
  );
});
/** ### PERSON_ID ---------------------------------------------------
 * @type {HTMLInputElement} */
const createPersonIdInput = createPersonForm["personId"];
createPersonIdInput.addEventListener("input", () => {
  createPersonIdInput.setCustomValidity(
    Person.checkPersonIdAsId(createPersonIdInput.value).message
  );
});
createPersonIdInput.value = PersonStorage.nextId().toString(); // initially the next free id

/** ### NAME -------------------------------------------------
 * @type {HTMLInputElement} */
const createPersonNameInput = createPersonForm["personName"];
createPersonNameInput.addEventListener("input", () => {
  createPersonNameInput.setCustomValidity(
    Person.checkName(createPersonNameInput.value).message
  );
});

/** ### AGENT -------------------------------------------------
 * @type {HTMLInputElement} */
const createPersonAgentSelect = createPersonForm["selectAgent"];
createPersonAgentSelect.addEventListener("change", () => {
  createPersonAgentSelect.setCustomValidity("input", () => {
    Person.checkAgent(PersonStorage.instances[createPersonAgentSelect.value]);
  });
});

/** ### SAVE_BUTTON -------------------------------------------------
 * @type {HTMLButtonElement} */
const createButton = createPersonForm["create"];
createButton.addEventListener("click", () => {
  /** @type {import("../m/Person.js").PersonSlots} */
  const slots = {
    personId: createPersonIdInput.value,
    name: createPersonNameInput.value,
    agent: createPersonAgentSelect.value,
  };

  createPersonIdInput.setCustomValidity(
    Person.checkPersonIdAsId(slots.personId).message
  );
  createPersonNameInput.setCustomValidity(Person.checkName(slots.name).message);
  createPersonAgentSelect.setCustomValidity(
    Person.checkAgent(slots.agent).message
  );

  if (createPersonForm.checkValidity()) {
    PersonStorage.add(slots);
  }
});

/******************************************************************************
 *** UPDATE *******************************************************************
 *****************************************************************************/

/** # FORM
 * @type {HTMLFormElement} */
const updatePersonForm = document.querySelector("section#Person-U > form");
document.getElementById("update").addEventListener("click", () => {
  document.getElementById("Person-M").style.display = "none";
  document.getElementById("Person-U").style.display = "block";
  fillSelectWithOptions(updateAgentSelection, PersonStorage.instances, "name");
  fillSelectWithOptions(updatePersonSelection, PersonStorage.instances, "name");
  updatePersonForm.reset();
});

/** ### PERSON_SELECTION ---------------------------------------------
 * @type {HTMLSelectElement} */
const updatePersonSelection = updatePersonForm["selectPerson"];
updatePersonSelection.addEventListener("change", () => {
  const personId = updatePersonSelection.value;

  if (personId) {
    const person = PersonStorage.instances[personId];
    updatePersonIdOutput.value = person.personId.toString();
    updateNameInput.value = person.name;
    updateAgentSelection.value = person.agent;
    updateButton.disabled = false;
  } else {
    updatePersonForm.reset();
    updateButton.disabled = true;
  }
});

/** ### PERSON_ID ----------------------------------------------------
 * @type {HTMLOutputElement} */
const updatePersonIdOutput = updatePersonForm["personId"];

/** ### NAME -------------------------------------------------------
 * @type {HTMLInputElement} */
const updateNameInput = updatePersonForm["personName"];
updateNameInput.addEventListener("input", () => {
  updateNameInput.setCustomValidity(
    Person.checkName(updateNameInput.value).message
  );
});
updateNameInput.setCustomValidity(
  Person.checkName(updateNameInput.value).message
);

/** ### AGENT -------------------------------------------------------
 * @type {HTMLInputElement} */
const updateAgentSelection = updatePersonForm["selectAgent"];
updateAgentSelection.addEventListener("change", () => {
  updateAgentSelection.setCustomValidity(
    Person.checkAgent(updateAgentSelection.value).message
  );
});
updateAgentSelection.setCustomValidity(
  Person.checkAgent(updateAgentSelection.value).message
);

/** ### SAVE_BUTTON -------------------------------------------------
 * @type {HTMLButtonElement} */
const updateButton = updatePersonForm["update"];
updateButton.addEventListener("click", () => {
  /** @type {import("../m/Person.js").PersonSlots} */
  const slots = {
    personId: updatePersonIdOutput.value,
    name: updateNameInput.value,
    agent: updateAgentSelection.value,
  };

  updateNameInput.setCustomValidity(Person.checkName(slots.name).message);
  updateAgentSelection.setCustomValidity(
    Person.checkAgent(slots.agent).message
  );

  if (updatePersonForm.checkValidity()) {
    PersonStorage.update(slots);
    updatePersonSelection.options[updatePersonSelection.selectedIndex].text =
      slots.name;
  }
});

/******************************************************************************
 *** DELETE *******************************************************************
 *****************************************************************************/

/** # FROM
 * @type {HTMLFormElement} */
const deletePersonForm = document.querySelector("section#Person-D > form");
document.getElementById("destroy").addEventListener("click", () => {
  document.getElementById("Person-M").style.display = "none";
  document.getElementById("Person-D").style.display = "block";

  fillSelectWithOptions(deletePersonSelection, PersonStorage.instances, "name");
  deletePersonForm.reset();
});

/** # PERSON_SELECTION
 * @type {HTMLSelectElement} */
const deletePersonSelection = deletePersonForm["selectPerson"];

/** ### SAVE_BUTTON -------------------------------------------------
 * @type {HTMLButtonElement} */
const deleteButton = deletePersonForm["delete"];
deleteButton.addEventListener("click", () => {
  const personIdRef = deletePersonSelection.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this Person?")) {
    PersonStorage.destroy(personIdRef);
    // remove deleted book from select options
    deletePersonForm.selectPerson.remove(
      deletePersonForm.selectPerson.selectedIndex
    );
  }
});
