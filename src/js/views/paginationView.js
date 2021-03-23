import View from './View.js';
import icons from 'url:../../img/icons.svg';

// This class will inherit all the properties and methodsdefined in its parent class
class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  _addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      // Making use of event delegation to determine which button is clicked
      const clickedEl = e.target.closest('.btn--inline'); // Important to use closest here cz buton contains svg, span and use html tags which could also be clicked by user. Closest ensures the button is clicked in any case
      console.log(clickedEl);

      if (!clickedEl) return; // Guard clause

      const gotoPage = +clickedEl.dataset.goto;
      //   console.log(gotoPage);

      handler(gotoPage);

      // What is happening here?
      // - An eventListener on a click of a button. When clicked, we register if backward/fwd button clicked according to the classes on the button. From the button css, we access a data attribute that conatains a number of the page that the search results should render if that button were clicked. That number is stored in gotoPage. That number is then passed into the handler which in this case would be controlPagination. controlPagination then executes whatever code inside it w/ the gotoPage variable passed in as a param. When the button is clicked, we should get the search results associated w/ that page number, remove the current ones, and change the buttons displayed
    });
  }

  // Just like all the other classes, you need generateMarkup cz it is called by render method in parent class
  _generateMarkup() {
    const curPage = this._data.page;
    // Computing how many pages there are
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    // console.log(numPages);

    // In order to tell JS to go back or forward a page, we need to add a data attribute to the buttons that we can access in our code to make the pagination change

    // On page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `
      <button data-goto="${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>
      `;
    }
    // On last page
    if (curPage === numPages && numPages > 1) {
      return `
      <button data-goto="${
        curPage - 1
      }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
      `;
    }
    // On a page where there are pages before and after
    if (curPage < numPages && curPage > 1) {
      return `
      <button data-goto="${
        curPage - 1
      }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
        <button data-goto="${
          curPage + 1
        }" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>
      `;
    }
    // On page 1, and there are no other pages
    return ``;
  }
}

export default new PaginationView();
