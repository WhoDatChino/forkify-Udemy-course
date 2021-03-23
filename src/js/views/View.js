// This will be the parent class of the other classes who need to make use of the same functions over an over. Exporting the class itself cz we are not creating any instance of this class, we are simply using it as a parent class of the child views
import icons from 'url:../../img/icons.svg';

// As of rn, parcel and babel do not support truly private class fields, therefore we have to use the old syntax for protected fields w/ the _
export default class View {
  _data;

  // This method will be common to all the classes
  /**
   * Render the recieved object to the DOM
   * @param {Object | Object[]} data The data to be rendered (eg. recipe)
   * @returns {undefined | string} A markup string is returned if render is false
   * @this {Object} View instance
   * @author Keano Bessa
   * @todo Finish the implementation
   */
  render(data) {
    // Check if data returned exists
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError(); // Empty array will not return the function therefore you need the ||. If there is no data, or if there is data and that data is in an array who's length equals 0, then return.

    this._data = data;

    const markup = this._generateMarkup();
    this._clear();

    // Rendering the recipe
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Update algorithm
  // What this will do is create a newMarkup, but will not render it. Instead, it will compare the new html to the current html and only change text/attributes that have changed from the current version to the new version
  update(data) {
    this._data = data;

    const newMarkup = this._generateMarkup(); // As if we are updating the whole View, but here we are only updting necessary elements

    // Converting the newMarkup html string to a DOM object living in the memory that we use to compare to the actual DOM living on the page
    const newDOM = document.createRange().createContextualFragment(newMarkup); // will essentially create a virtual DOM (doesnt live on page, but is in memory). From the string an object will be created known as a document fragment
    const newElements = Array.from(newDOM.querySelectorAll('*')); // * means all. Node list converted to array
    // console.log(newElements); // Shows all the elements contained in the new dom element we created from the newMarkup generated from the updated data. (Originally brings up nodeList of what essentially would be rendered on the DOM from the button press [converted to array manually])

    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    // console.log(`CURRENT`, curElements); // What is currently displayed on the app
    // console.log(`NEW`, newElements); // What would be displayed after the + button clicked on servings

    // Looping over both arrays at the same time
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      //   console.log(curEl, newEl.isEqualNode(curEl)); // Method available to nodes. Compares the content of newEl to that of curEl

      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
        // Explanation: 1st condition -> property available on nodes that tests whether 2 nodes are equal. Compares newEl & curEl. In this case we want to search for nodes that are NOT equal. Unequal nodes now will also be tested if they are text content - we only want to change the text content on those nodes. To do so, use another property avaialble on nodes called nodeValue. Value of nodeValue will be null if it is pretty much anything but text (if null, the whole condition will be false -> replacement wont take place). If it is text, it will return the contnent of the text node.(also added optional chaining). trim() is just removing whitespace from string. We want to select the child node cz that is what contains the text, newEl is really just an element node and not a text node (what is the text is in fact the first child node [from advanced DOM]). We want this text to NOT be empty ie different from an empty string.
        // Summary: If the newEl and curEl are different and the text of the newEl is not empty, then we apply the following code
      ) {
        // console.log(`😉☑`, newEl.firstChild.nodeValue.trim()); //
        curEl.textContent = newEl.textContent;
      }

      // Updates changed ATTRIBUTES
      // Changing the data attributes when the curEl is different from the newEl. This cant be done in above if statement cz that only applies to the text content of the elements, nothing to do w/ code
      if (!newEl.isEqualNode(curEl)) {
        // console.log(`😉`, Array.from(newEl.attributes)); // Logs attributes property of all the elements that changed
        Array.from(newEl.attributes).forEach(
          attr => curEl.setAttribute(attr.name, attr.value) // Replaces all the attributes in the curEl w/ the attributes coming from the newEl
        );
      }

      // Not really an algorithm to use in larger projects irl
    });
  }

  // This method will be available to all the views so long as they have a parentElement property
  _clear() {
    // Removing the welcome message once a recipe is displayed
    this._parentElement.innerHTML = '';
  }

  // Loading spinner - can be attached to any parent element
  renderSpinner() {
    const markup = `
      <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Renders specific error messages.
  // Has to do w/ the DOM therefore it is inserted in View
  // Want a way of getting the error handled by the model into here so that we can manipulate the DOM based on the error
  renderError(message = this._errorMessage) {
    const markup = `
    <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
    `;

    // When an error occurs, we want the recipeContainer (parentElement) to be cleared of any of its contents after which we then insert the html specified above
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Renders success message
  renderMessage(message = this._message) {
    const markup = `
    <div class="recipe">
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;

    // When an error occurs, we want the recipeContainer (parentElement) to be cleared of any of its contents after which we then insert the html specified above
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
