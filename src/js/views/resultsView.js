import View from './View.js';
import icons from 'url:../../img/icons.svg';

// This class will inherit all the properties and methodsdefined in its parent class
class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = `No recipes found for your query. Please try again`;
  _message = '';

  // All the child views should have this method cz the render() method in the parent relies on the generateMarkup()
  _generateMarkup() {
    // console.log(this._data); // data is in the form of an array. We want to return one of the below html elements for each of the elements in that array

    return this._data.map(this._generateMarkupPreview).join('');
  }

  _generateMarkupPreview(result) {
    // Implementing active class to currently selected recipe. Add class to a tag when the result id is the same as the id in the url
    const id = window.location.hash.slice(1);

    return `
    <li class="preview">
        <a class="preview__link ${
          result.id === id ? 'preview__link--active' : ''
        }" href="#${result.id}">
            <figure class="preview__fig">
                <img src="${result.image}" alt="${result.title}" />
            </figure>
            <div class="preview__data">
                <h4 class="preview__title">${result.title}</h4>
                <p class="preview__publisher">${result.publisher}</p>
                <div class="preview__user-generated ${
                  result.key ? '' : 'hidden'
                }">
                <svg>
                  <use href="${icons}#icon-user"></use>
                </svg>
              </div>
            </div>
        </a>
    </li>
  `;
  }
}

export default new ResultsView();
