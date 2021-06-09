/**
 * @fileOverview  Defines utility procedures/functions
 * @author Gerd Wagner
 * @author Christian Prinz
 * @author Max Bergmann
 */
import { Enumeration } from "./Enumeration.js";

/**
 * Creates a typed "data clone" of an object
 * @param {object} obj to get a clone of
 * @returns {object} - the cloned object
 */
export function cloneObject(obj) {
  var p = "";
  var val;
  var clone = Object.create(Object.getPrototypeOf(obj));
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      val = obj[p];
      if (val) {
        if (
          typeof val === "number" ||
          typeof val === "string" ||
          typeof val === "boolean" ||
          val instanceof Date ||
          /* typed object reference */
          (typeof val === "object" && !!val.constructor) ||
          /* list of data values */
          (Array.isArray(val) && !val.some((el) => typeof el === "object")) ||
          /* list of typed object references */
          (Array.isArray(val) &&
            val.every((el) => typeof el === "object" && !!el.constructor))
        ) {
          if (Array.isArray(val)) clone[p] = val.slice(0);
          else clone[p] = val;
        }
        // else clone[p] = cloneObject(val);
      }
    }
  }
  return clone;
}

/**
 * Verifies if the given value is ether of type `Date` or a valid date string.
 * @param {Date | string} date to validate
 * @returns {boolean} `true` if the date is a `Date` or a string that can be parsed to a date
 */
export function isDateOrDateString(date) {
  return (
    date !== undefined && (date instanceof Date || !isNaN(Date.parse(date)))
  );
}

/**
 * receives a date and immediately returns it, if it is `instanceof Date`,
 * or creates a new Date otherwise. Then it has to be validated as a date string
 * @param {Date | string} date to possibly parse
 * @returns {Date}
 */
export function parseDate(date) {
  return date instanceof Date ? date : new Date(date);
}

/**
 * @param {Date} date
 * @returns the date as a string in form of `"YYYY-MM-DD"`
 */
export function getRawDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * compares two possible dates on equality. This function also considers string
 * formatted and undefined dates.
 * @param {Date | string | undefined} a
 * @param {Date | string | undefined} b
 * @returns {-2 | -1 | 0 | 1 | 2} a `number` that indicates the result:
 * - `-2 = !a & b` (`a` is undefined or no Date, but `b`)
 * - `-1 = a < b`
 * - `0 = equal` (both equal || undefined || no Date)
 * - `1 = a > b`
 * - `2 = a & !b` (`b` is undefined or no Date, but `a`)
 */
export function compareDates(a, b) {
  // both undefined OR no dates => TRUE
  if ((!a || !isDateOrDateString(a)) && (!b || !isDateOrDateString(b)))
    return 0;
  // ==> AT LEAST ONE OF THEM IS A DATE
  // a is undefined OR no Date but b is both
  else if ((!a && b) || (!isDateOrDateString(a) && isDateOrDateString(b)))
    return -2;
  // b is undefined OR no Date but a is both
  else if ((a && !b) || (isDateOrDateString(a) && !isDateOrDateString(b)))
    return 2;
  // => BOTH ARE DEFINED AND DATES
  else {
    if (parseDate(a).getTime() === parseDate(b).getTime()) return 0;
    else return parseDate(a).getTime() > parseDate(b).getTime() ? 1 : -1;
  }
}

/**
 * Verifies if a value represents an integer or integer string
 * @param {string | number} x to verify
 * @return {boolean}
 */
export function isIntegerOrIntegerString(x) {
  return (
    (typeof x === "number" && Number.isInteger(x)) ||
    (typeof x === "string" && x.search(/^-?[0-9]+$/) === 0)
  );
}

/**
 * receives a number and immediately returns it, if it is `typeof "number"`,
 * or parses it with `Number(...)` otherwise.
 * @param {number | string} value the string OR number to parse
 * @returns {number} the parsed number
 */
export function parseStringInteger(value) {
  return typeof value === "number" ? value : Number(value);
}

/**
 * Create a DOM option element
 *
 * @param {string} val the option.value
 * @param {string} [txt] [optional] the option.txt - will be replaced with `val` if undefined
 * @param {string} [classValues] [optional] the option.className
 *
 * @return {HTMLOptionElement} an `"option"` document element
 */
function createOption(val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt || val;
  if (classValues) el.className = classValues;
  return el;
}

/**
 * Fill a select element with option elements created from a
 * map of objects
 *
 * @param {HTMLSelectElement} selectEl  A select(ion list) element
 * @param {{[key: string]: object} | string[]} selectionRange  A map of objects or an array list
 * @param {any} [optPar] [optional]  An optional parameter record including // TODO type = {selection: number[], displayProp: string} | string ???
 *     optPar.displayProp and optPar.selection
 */
export function fillSelectWithOptions(selectEl, selectionRange, optPar) {
  // create option elements from object property values
  const options = Array.isArray(selectionRange)
    ? selectionRange
    : Object.keys(selectionRange);

  // delete old contents
  selectEl.innerHTML = "";

  // create "no selection yet" entry
  if (!selectEl.multiple) {
    selectEl.add(createOption("", " --- ", undefined));
  }
  for (const i of options.keys()) {
    /** @type {HTMLOptionElement} */
    let optionEl = null;
    if (Array.isArray(selectionRange)) {
      optionEl = createOption((i + 1).toString(), options[i], undefined);
      if (
        selectEl.multiple &&
        optPar &&
        optPar.selection &&
        optPar.selection.includes(i + 1)
      ) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }
    } else {
      const key = options[i];
      const obj = selectionRange[key];
      if (optPar && optPar.displayProp) {
        optionEl = createOption(key, obj[optPar.displayProp], undefined);
      } else {
        // TODO: optPar can be null here!
        optionEl = createOption(key, obj[optPar], undefined);
      }

      // if invoked with a selection argument, flag the selected options
      if (
        selectEl.multiple &&
        optPar &&
        optPar.selection &&
        optPar.selection[key]
      ) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }
    }
    selectEl.add(optionEl);
  }
}

/**
 * Create a choice control (radio button or checkbox) element
 *
 * @param {"radio" | "checkbox"} t  The type of choice control ("radio" or "checkbox")
 * @param {string} n  The name of the choice control input element
 * @param {string} v  The value of the choice control input element
 * @param {string} lbl  The label text of the choice control
 * @return {HTMLLabelElement}
 */
function createLabeledChoiceControl(t, n, v, lbl) {
  var ccEl = document.createElement("input");
  var lblEl = document.createElement("label");
  ccEl.type = t;
  ccEl.name = n;
  ccEl.value = v;
  lblEl.appendChild(ccEl);
  lblEl.appendChild(document.createTextNode(lbl));
  return lblEl;
}

/**
 * Create a choice widget in a given fieldset element.
 * A choice element is either an HTML radio button or an HTML checkbox.
 * @param {HTMLFieldSetElement} containerEl the element (widget) containing the choices
 * @param {string} fld the identifier of the widget
 * @param {number[]} values the initial values that are set
 * @param {"radio" | "checkbox"} choiceWidgetType the type of the widget (`"radio" | "checkbox"`)
 * @param {string[]} choiceItems the labels of the choices
 * @param {boolean} isMandatory if true -> presets the first option
 * @returns {HTMLFieldSetElement} the modified `containerEl`, but also works without using the returned element though it is modified anyways.
 */
export function createChoiceWidget(
  containerEl,
  fld,
  values,
  choiceWidgetType,
  choiceItems,
  isMandatory
) {
  const choiceControls = containerEl.querySelectorAll("label");
  // remove old content
  for (const j of choiceControls.keys()) {
    containerEl.removeChild(choiceControls[j]);
  }
  if (!containerEl.hasAttribute("data-bind")) {
    containerEl.setAttribute("data-bind", fld);
  }
  // for a mandatory radio button group initialize to first value
  if (choiceWidgetType === "radio" && isMandatory && values.length === 0) {
    values[0] = 1;
  }
  if (values.length >= 1) {
    if (choiceWidgetType === "radio") {
      containerEl.setAttribute("data-value", values[0].toString());
    } else {
      // checkboxes
      containerEl.setAttribute("data-value", "[" + values.join() + "]");
    }
  }
  for (const j of choiceItems.keys()) {
    // button values = 1..n
    const el = createLabeledChoiceControl(
      choiceWidgetType,
      fld,
      (j + 1).toString(),
      choiceItems[j]
    );
    /** @ts-ignore @type {HTMLInputElement} */
    const firstChild = el.firstElementChild;
    // mark the radio button or checkbox as selected/checked
    if (values.includes(j + 1)) firstChild.checked = true;
    containerEl.appendChild(el);
    firstChild.addEventListener("click", (e) => {
      /** @ts-ignore @type {HTMLInputElement} */
      const btnEl = e.target;
      if (choiceWidgetType === "radio") {
        if (containerEl.getAttribute("data-value") !== btnEl.value) {
          containerEl.setAttribute("data-value", btnEl.value);
        } else if (!isMandatory) {
          // turn off radio button
          btnEl.checked = false;
          containerEl.setAttribute("data-value", "");
        }
      } else {
        // checkbox
        let cbValues = JSON.parse(containerEl.getAttribute("data-value")) || [];
        let i = cbValues.indexOf(parseInt(btnEl.value));
        if (i > -1) {
          cbValues.splice(i, 1); // delete from value list
        } else {
          // add to value list
          cbValues.push(btnEl.value);
        }
        containerEl.setAttribute("data-value", "[" + cbValues.join() + "]");
      }
    });
  }
  return containerEl;
}

/**
 * checks if a given string is of type `string` and of length `[min, max]`
 * - eg.: `isStringInRange(x,2,6)` returns `true` if `x.length >= 2 && x.length <=6`
 * - the `max` value is optional. If it is `undefined` then the upper bound will be
 * `Number.MAX_VALUE` which is *Equal to approximately 1.79E+308*
 * @param {string} str to check
 * @param {number} min the inclusive minimum length the string must have
 * @param {number} max [optional] the inclusive maximum length the string must be lower than
 * @returns {boolean} `true` if the string is a string and inside the range
 */
export function isStringInRange(str, min, max = Number.MAX_VALUE) {
  return typeof str === "string" && str.length >= min && str.length < max;
}

/**
 * Add an item to a Choice Set element
 *
 * @param {HTMLUListElement} listEl  A list element
 * @param {string} stdId  A standard identifier of an object
 * @param {string} humanReadableId  A human-readable ID of the object
 * @param {string} [classValue]
 */
function addItemToChoiceSet(listEl, stdId, humanReadableId, classValue) {
  /** @type {HTMLLIElement} */
  let listItemEl = null;
  /** @type {HTMLElement} */
  let el = null;
  listItemEl = document.createElement("li");
  listItemEl.setAttribute("data-value", stdId);
  el = document.createElement("span");
  el.textContent = humanReadableId;
  listItemEl.appendChild(el);
  el = createPushButton("✕");
  listItemEl.appendChild(el);
  if (classValue) listItemEl.classList.add(classValue);
  listEl.appendChild(listItemEl);
}

/**
 * Create a Push Button
 * @param {string} txt [optional]
 * @return {HTMLButtonElement}
 */
function createPushButton(txt) {
  /** @type {HTMLButtonElement} */
  const pB = document.createElement("button");
  pB.type = "button";
  if (txt) pB.textContent = txt;
  return pB;
}

/**
 * Fill a Choice Set element with items
 *
 * @param {HTMLUListElement} listEl  A list element
 * @param {{[key: string]: object}} selection  An entity table for filling the Choice Set
 * @param {string} keyProp  The standard ID property of the entity table
 * @param {string} displayProp  A text property of the entity table
 */
function fillChoiceSet(listEl, selection, keyProp, displayProp) {
  /** @type {string[]} */
  let options = [];
  /** @type {string[]} */
  let obj = null;
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  options = Object.keys(selection);
  for (const j of options.keys()) {
    obj = selection[options[j]];
    addItemToChoiceSet(listEl, obj[keyProp], obj[displayProp]);
  }
}

/**
 *
 * @param {HTMLElement} widgetContainerEl
 * @param {{[key: string]: object}} selection
 * @param {{[key: string]: object}} selectionRange
 * @param {string} keyProp
 * @param {string} displayProp
 * @param {number} minCard TODO this is not used anyways
 */
export function createMultipleChoiceWidget(
  widgetContainerEl,
  selection,
  selectionRange,
  keyProp,
  displayProp,
  minCard
) {
  let assocListEl = document.createElement("ul"); // shows associated objects
  let selectEl = document.createElement("select");
  /** @type {HTMLDivElement} */
  let el = null;
  // delete old contents
  widgetContainerEl.innerHTML = "";
  // create association list items from property values of associated objects
  if (!displayProp) displayProp = keyProp;
  fillChoiceSet(assocListEl, selection, keyProp, displayProp);
  // event handler for removing an associated item from the association list
  assocListEl.addEventListener("click", (e) => {
    /** @type {HTMLLIElement} */
    let listItemEl = null;
    /** @ts-ignore @type {HTMLButtonElement} */
    const btnEl = e.target;
    if (btnEl.tagName === "BUTTON") {
      // @ts-ignore delete/undo button
      listItemEl = btnEl.parentNode;
      if (listItemEl.classList.contains("removed")) {
        // undoing a previous removal
        listItemEl.classList.remove("removed");
        // change button text
        btnEl.textContent = "✕";
      } else if (listItemEl.classList.contains("added")) {
        // removing an added item means moving it back to the selection range
        listItemEl.parentNode.removeChild(listItemEl);
        const optionEl = createOption(
          listItemEl.getAttribute("data-value"),
          listItemEl.firstElementChild.textContent
        );
        selectEl.add(optionEl);
      } else {
        // removing an ordinary item
        listItemEl.classList.add("removed");
        // change button text
        btnEl.textContent = "undo";
      }
    }
  });
  widgetContainerEl.appendChild(assocListEl);
  el = document.createElement("div");
  el.appendChild(selectEl);
  el.appendChild(createPushButton("add"));
  // event handler for adding an item from the selection list to the association list
  selectEl.parentNode.addEventListener("click", (e) => {
    // @ts-ignore
    assocListEl = e.currentTarget.parentNode.firstElementChild;
    // @ts-ignore
    selectEl = e.currentTarget.firstElementChild;
    // @ts-ignore
    if (e.target.tagName === "BUTTON") {
      // add button
      if (selectEl.value) {
        addItemToChoiceSet(
          assocListEl,
          selectEl.value,
          selectEl.options[selectEl.selectedIndex].textContent,
          "added"
        );
        selectEl.remove(selectEl.selectedIndex);
        selectEl.selectedIndex = 0;
      }
    }
  });
  widgetContainerEl.appendChild(el);
  // create select options from selectionRange minus selection
  fillMultipleChoiceWidgetWithOptions(selectEl, selectionRange, keyProp, {
    displayProp,
    selection,
  });
}

/**
 * Fill the select element of an Multiple Choice Widget with option elements created
 * from the selectionRange minus an optional selection set specified in optPar
 *
 * @param {HTMLSelectElement} selectEl  A select(ion list) element
 * @param {{[key: string]: object}} selectionRange  A map of objects
 * @param {string} keyProp  The standard identifier property
 * @param {any} [optPar] [optional]  An optional parameter record including // TODO type = {selection: number[], displayProp: string} | string ???
 */
function fillMultipleChoiceWidgetWithOptions(
  selectEl,
  selectionRange,
  keyProp,
  optPar
) {
  var options = [],
    obj = null,
    displayProp = "";
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  selectEl.add(createOption("", " --- "));
  // create option elements from object property values
  options = Object.keys(selectionRange);
  for (const i of options.keys()) {
    // if invoked with a selection argument, only add options for objects
    // that are not yet selected
    if (!optPar || !optPar.selection || !optPar.selection[options[i]]) {
      obj = selectionRange[options[i]];
      if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
      else displayProp = keyProp;
      selectEl.add(createOption(obj[keyProp], obj[displayProp]));
    }
  }
}

/**
 *
 * @param {{[key: string] : object}} eTbl  An entity table
 * @param {string} displayProp  The object property to be displayed in the list
 * @param {Enumeration} [enumEl] the enumeration that can be used instead of displayProp
 * @returns {HTMLUListElement}
 */
export function createListFromMap(eTbl, displayProp, enumEl) {
  const listEl = document.createElement("ul");
  fillListFromMap(listEl, eTbl, displayProp, enumEl);
  return listEl;
}

/**
 * Fill a list element with items from an entity table
 *
 * @param {HTMLUListElement} listEl  A list element
 * @param {{[key: string] : object}} eTbl  An entity table
 * @param {string} displayProp  The object property to be displayed in the list
 * @param {Enumeration} [enumEl] that should be used to print correct value
 */
function fillListFromMap(listEl, eTbl, displayProp, enumEl) {
  const keys = Object.keys(eTbl);
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  for (const key of keys) {
    const listItemEl = document.createElement("li");
    if (enumEl) {
      listItemEl.textContent = enumEl.labels[eTbl[key] - 1];
    } else {
      listItemEl.textContent = eTbl[key][displayProp];
    }

    listEl.appendChild(listItemEl);
  }
}

/**
 * Verifies if the value is a string and has at least one Character (whitespace-trimmed).
 * @param {string} x
 * @return {boolean}
 */
export function isNonEmptyString(x) {
  return typeof x === "string" && x.trim() !== "";
}
