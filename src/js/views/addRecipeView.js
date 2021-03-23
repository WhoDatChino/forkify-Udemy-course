import View from './View.js';
import icons from 'url:../../img/icons.svg';

// Form we want to display is already in the html. Simply need to remove the hidden class from the html elements we want to show
class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload'); // parent cz its the main thing we are concerned w/ -> the form
  // Altogether it has 3 elements. The form, the overlay and the container of the form
  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  // Additionally there are 2 buttons -> to open the form and to close it
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');
  // Success message
  _message = `Recipe was successfully uploaded`;

  constructor() {
    super(); // Called cz this is a child class
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  // Method to show recipe creation window
  // Want this function to be called as soon as page loads. This function has nothing to do w/ any controller, doesnt need to interfere. Therefore the need for the constructor -> needed in order for this function to be executed on startup
  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this)); // Manaully binding 'this'
  }
  // {
  //   this._overlay.classList.toggle('hidden'); // Cant do this cz 'this' points to element on which eventListener is attached (btnOpen)
  //   this._window.classList.toggle('hidden'); // Solution -> export this function to another method and call that method w/ correct 'this' bound to it
  // });

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  // Method to hide recipe creation window
  // Also has nothing to do w/ controller, simply needs to be called in the constructor
  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this)); // Manaully binding 'this'
    this._overlay.addEventListener('click', this.toggleWindow.bind(this)); // Manaully binding 'this'
  }

  // Method that handles upload button in form (form submission)
  _addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();

      // Reading info from form. Can either a) read value property off each input indivdually OR b) use form data (browser api)
      // This data is the data we eventually want to uplaod to api. Uploading data is just another api call which happens in the model w/ the rest of the calls. Need to get this data to the model through a controller function which will be the handler of this event
      const dataArr = [...new FormData(this)]; // Have to pass in an element that is a form. In this case its 'this' cz we inside a handler function attached to that form. FormData returs a starnge object we cant really use so we spread that object into an array of arrays. Internal arrays contain each field w/ their corresponding value inside
      const data = Object.fromEntries(dataArr); // Method is essentially the opposite from the entries method that is available on arrays. This takes an array of entries and then converts it to an object. Needs to be a list of key-value pairs stored in arrays where those arrays are stored in a parent array
      handler(data);
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView(); // Still need to export to controller else this file will never be executed by controller.js and the objects in here will never be created
