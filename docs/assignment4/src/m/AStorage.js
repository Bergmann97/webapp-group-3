export class AStorage {
    /** the current instances of the Storage used as a collection map
     * @protected
     * @type {{[key: number]: any}}
     */
    _instances = {};
  
    /**
     * The internal key of the `localStorage[<key>]`
     * @protected
     * @type {string}
     */
    _key;
  
    /**
     * constructs an abstract localStorage
     * @param {string} key The internal key of the `localStorage[<key>]`
     */
    constructor(key) {
      this._key = key;
    }
  
    /**
     * adds a new Movie created from the given `slots` to the collection of `Movie`s
     * if the slots fulfil their constraints. Does nothing otherwise
     * @protected
     * @param {number | string} id
     * @param {any} instance
     */
    set(id, instance) {
      if (instance) {
        this._instances[id] = instance;
      }
    }
  
    /**
     * deletes the `Movie` with the corresponding `movieId` from the `this.instances`
     * @protected
     * @param {number | string} id
     */
    delete(id) {
      console.info(`${this._instances[id].toString()} deleted`);
      delete this._instances[id];
    }
  
    /**
     * loads all stored Movies from the `localStorage`, parses them and stores them
     * to the `this.instances`
     * @protected
     * @returns {string} the serialized content of the storage
     */
    load() {
      let serialized = "";
      try {
        if (localStorage[this._key]) {
          serialized = localStorage[this._key];
        }
      } catch (e) {
        alert(`Error when reading from Local Storage "${this._key}"\n` + e);
      }
      return serialized;
    }
  
    /**
     * stores all `Movie`s from the `this.instances` to the `localStorage`
     * @protected
     */
    store() {
      var serialized = "";
      const itemCount = Object.keys(this._instances).length;
      try {
        serialized = JSON.stringify(this._instances);
        localStorage.setItem(this._key, serialized);
        console.info(`${itemCount} items saved to Local Storage ${this._key}.`);
      } catch (e) {
        alert(`Error when writing to Local Storage "${this._key}"\n` + e);
      }
  
      return itemCount;
    }
  
    /**
     * checks if a `Movie` with the given `id` exists in the storage.
     * @protected
     * @param {number | string} id the identifier of the movie to check
     * @returns true if the movie exists in the storage
     */
    contains(id) {
      return Object.keys(this._instances).includes(id.toString());
    }
  
    /**
     * clears all `Movie`s from the `this.instances`
     * @protected
     */
    clear() {
      this._instances = {};
      localStorage[this._key] = "{}";
    }
  }
  