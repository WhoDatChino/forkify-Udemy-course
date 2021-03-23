// Search functionality has clearly to do w/ the DOM, therefore it is put into its own module w/in the views and then export an instance of it to controller

// This class will not render anything, all it will do is get the query and listen for a click event on the button
class SearchView {
  _parentElement = document.querySelector('.search');

  // Method that will be called by controller
  // This could have been written in the controller, BUT it would not conform to MVC architecture
  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  // CLears search box once form is submitted
  // Could, again, be inside controller since its only 1 line, but having it in search view conforms to MVC cz this operates on the DOM
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  // Called in the controller right in the beginning in the init function
  addHandlerSearch(handler) {
    // Listening for submit on parent rather than click cz the full element is a form and the eventListener will be fired no matter if enter is clicked or the button is clicked
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault(); // Since this is a form element, we first need to prevent the page reload upon submission before we call the handler function
      handler(); // this will be the controlSearchResults function.
    });
  }
}

export default new SearchView();
