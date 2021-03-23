// One of many view modules (MVC)

// Importing parent
import View from './View.js';

// Fractional library installed through npm
import { Fraction } from 'fractional'; // Destructure cz returns object called fraction w/ another object inside called fraction that actually contains the data
// console.log(Fraction);

// W/ parcel, you can import all kinds of files and that includes images which includes icons
// import icons from '../img/icons.svg' // Parcel 1 => ../ moves to parent folder(src folder) (same as terminal navigation). Start from perspective of controller.js
import icons from 'url:../../img/icons.svg'; // Parcel 2 -> Added part for any static assets that are not programming files(video,imgages,sounds) => Need to do this cz we are developing w/ parcel already engaged. The parcel'd folders contain the path to the image folder which is different to the one we use in development. Importing this gives use access to file called icons.d6e47c37.svg in dist.
// Everywhere in inserted html where you had a link to the icons like: /img/icons.svg -> you now replace w/ this import

// Reasons for using classes: Want each view to have some private methods and properties. Also going to have a parent class View that all the children will inherit.
class RecipeView extends View {
  _parentElement = document.querySelector('.recipe'); // Makes it easy to render spinner/succes or error messages/ recipe itself. If each of the views have that parent element property, it will make it really easy to do all the aforementione tasks

  // Default error message
  _errorMessage = `We could not find the recipe. Please try another one`;
  // Default success message
  _message = '';

  // Private method
  _generateMarkup() {
    return `
    <figure class="recipe__fig">
          <img src="${this._data.image}" alt="${
      this._data.title
    }" class="recipe__img" />
          <h1 class="recipe__title">
            <span>${this._data.title}</span>
          </h1>
        </figure>

        <div class="recipe__details">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${
              this._data.cookingTime
            }</span>
            <span class="recipe__info-text">minutes</span>
          </div>
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${
              this._data.servings
            }</span>
            <span class="recipe__info-text">servings</span>

            <div class="recipe__info-buttons">
              <button data-newservings="${
                this._data.servings - 1
              }" class="btn--tiny btn--update-servings">
                <svg>
                  <use href="${icons}#icon-minus-circle"></use>
                </svg>
              </button>
              <button data-newservings="${
                this._data.servings + 1
              }" class="btn--tiny btn--update-servings">
                <svg>
                  <use href="${icons}#icon-plus-circle"></use>
                </svg>
              </button>
            </div>
          </div>

          <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
            <svg>
              <use href="${icons}#icon-user"></use>
            </svg>
          </div>
          <button class="btn--round btn--bookmark">
            <svg class="">
              <use href="${icons}#icon-bookmark${
      this._data.bookmarked ? '-fill' : ''
    }"></use>
            </svg>
          </button>
        </div>

        
        <div class="recipe__ingredients">
          <h2 class="heading--2">Recipe ingredients</h2>
          <ul class="recipe__ingredient-list">
         ${this._data.ingredients.map(this._generateMarkupIngredient).join('')}

        </ul>            
        </div>

        <div class="recipe__directions">
          <h2 class="heading--2">How to cook it</h2>
          <p class="recipe__directions-text">
            This recipe was carefully designed and tested by
            <span class="recipe__publisher">${
              this._data.publisher
            }</span>. Please check out
            directions at their website.
          </p>
          <a
            class="btn--small recipe__btn"
            href="${this._data.sourceURL}"
            target="_blank"
          >
            <span>Directions</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </a>
        </div>
  `;
    // For ingredients: Need to loop over the ingredients array which contains an object for each ingredient containing info about it. For each ingredient we want to to create an html string to displa the info correctly. The map method creates an array where each element is an html string that corresponds w/ the info about the ingredient it is asscoiated w/. From that array of strings, we want to transform it into a single string. Take result of map and call join()
  }

  // Pub/Sub design pattern. Subscriber is controlRecipes (handler)
  // Part of public api of this class so that we can call it in the controller
  addHandlerRender(handler) {
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  // Event Listener associated w/ listening for button clicks on changing serving sizes
  addHandlerServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const clickedEl = e.target.closest('.btn--update-servings');
      if (!clickedEl) return;
      // console.log(clickedEl);

      // Need to pass in newServings into handler. To identify whether there is an increase or decrease, make use of data attributes
      const newServings = +clickedEl.dataset.newservings;
      // console.log(newServings);
      if (newServings > 0 && newServings < 26) handler(newServings);
    });
  }

  addHandlerAddBookmark(handler) {
    // Adding listener to parent element instead of btn--bookmark class cz when page loads, this button does not exist yet. Therefore need to make use of event delegation
    this._parentElement.addEventListener('click', function (e) {
      const clickedEl = e.target.closest('.btn--bookmark');
      // console.log(clickedEl);
      if (!clickedEl) return;
      handler();
    });
  }

  _generateMarkupIngredient(ing) {
    return `
         <li class="recipe__ingredient">
           <svg class="recipe__icon">
             <use href="${icons}#icon-check"></use>
           </svg>
           <div class="recipe__quantity">${
             ing.quantity ? new Fraction(ing.quantity).toString() : ''
           }</div>
           <div class="recipe__description">
             <span class="recipe__unit">${ing.unit}</span>
             ${ing.description}
           </div>
         </li>
         `;
  }
}

// Creating and exporting an object rather than the classes themselves cz this way functions outdie this module will not have access to the classes
export default new RecipeView(); // No data passed in therefore no constructor needed
