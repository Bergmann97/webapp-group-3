import { Person } from "../m/Person.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";
import { fillSelectWithOptions }
    from "../../lib/util.js";

// loading the data
PersonStorage.retrieveAll();
MovieStorage.retrieveAll();

// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all CRUD UIs
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}

// ---------- RETRIEVE AND LIST ALL ----------
document.getElementById("retrieveAndListAll").addEventListener(
  "click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-R").style.display = "block";

    const tableBodyEl = document.
      querySelector("section#Person-R > table > tbody");
    tableBodyEl.innerHTML = "";  // drop old content
    for (const key of Object.keys( PersonStorage.instances)) {
        const person = PersonStorage.instances[key];
        const row = tableBodyEl.insertRow();
        row.insertCell().textContent = person.personId;
        row.insertCell().textContent = person.name;
    }
});

// ---------- CREATE ----------
const createFormEl = document.querySelector("section#Person-C > form"),
      createPersonIdEl = createFormEl.personid,
      createNameEl = createFormEl.name;
document.getElementById("create").addEventListener(
  "click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-C").style.display = "block";
});
// check validity on input
createPersonIdEl.addEventListener("input", function () {
  createPersonIdEl.setCustomValidity(
      Person.checkPersonIdAsId( createPersonIdEl.value).message);
});
createNameEl.addEventListener("input", function () {
  createNameEl.setCustomValidity(
      Person.checkName( createNameEl.value).message);
});
// check for error messages
createPersonIdEl.setCustomValidity(
  Person.checkPersonIdAsId(createPersonIdEl.value).message);
createNameEl.setCustomValidity(
  Person.checkName(createNameEl.value).message);
// save button handling
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    personId: createPersonIdEl.value,
    name: createNameEl.value,
  };

  createPersonIdEl.setCustomValidity(
    Person.checkPersonIdAsId( slots.personId).message);
  createNameEl.setCustomValidity(Person.checkName( slots.name).message);
  
  if (createFormEl.checkValidity()) {
    PersonStorage.add( slots);
  }
});

// ---------- UPDATE ----------
const updateFormEl = document.querySelector("section#Person-U > form"),
      updatePersonIdEl = updateFormEl.personid,
      updateNameEl = updateFormEl.name,
      selectedUpdatePersonEl = updateFormEl.selectPerson;
document.getElementById("update").addEventListener(
  "click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-U").style.display = "block";
    fillSelectWithOptions( selectedUpdatePersonEl, PersonStorage.instances,
      "name");
    updateFormEl.reset();
});
selectedUpdatePersonEl.addEventListener("change", function () {
  const formEl = document.querySelector("section#Person-U > form"),
    saveBtn = formEl.commit,
    personId = formEl.selectPerson.value;
  
  if (personId) {
    const person = PersonStorage.instances[personId];
    formEl.personid.value = person.personId;
    formEl.name.value = person.name;
    saveBtn.disabled = false;
  } else {
    formEl.reset();
    saveBtn.disabled = true;
  }
});
// check validity on input for name
updateNameEl.addEventListener("input", function () {
  updateNameEl.setCustomValidity(
      Person.checkName( updateNameEl.value).message);
});
// check for error messages for name
updateNameEl.setCustomValidity(
  Person.checkName(updateNameEl.value).message);
// save button handling
updateFormEl["commit"].addEventListener("click", function () {
  const slots = {
    personId: updatePersonIdEl.value,
    name: updateNameEl.value,
  };

  updateNameEl.setCustomValidity(Person.checkName( slots.name).message);
  
  if (updateFormEl.checkValidity()) {
    PersonStorage.update( slots);
    selectedUpdatePersonEl.options[selectedUpdatePersonEl.selectedIndex].text = slots.name;
  }
});

// ---------- DELETE ----------
const deleteFormEl = document.querySelector("section#Person-D > form"),
      selectedDeletePersonEl = deleteFormEl.selectPerson;
document.getElementById("destroy").addEventListener(
  "click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-D").style.display = "block";

    fillSelectWithOptions( selectedDeletePersonEl, PersonStorage.instances,
      "name");
    deleteFormEl.reset();
});
deleteFormEl["commit"].addEventListener("click", function () {
  const personIdRef = selectedDeletePersonEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this Person?")) {
    PersonStorage.destroy(personIdRef);
    // remove deleted book from select options
    deleteFormEl.selectPerson.remove(deleteFormEl.selectPerson.selectedIndex);
  }
});

// save data when leaving the page
window.addEventListener("beforeunload", function () {
  PersonStorage.persist();
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