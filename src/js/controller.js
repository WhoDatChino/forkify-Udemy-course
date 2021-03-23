// 1 File for all the controllers
// Controller is not concerned w/ DOM at all. We do NOT want any DOM element related things in this module. Dont even want to know what the DOM looks like

// Importing modules from View file
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// Importing from config
import { MODAL_CLOSE_SECONDS } from './config.js';

// Imports from the Model
import * as model from './model.js';

// Imports to ensure code works in older browsers
import 'core-js/stable'; // For polyfilling es6 syntax
import 'regenerator-runtime/runtime'; // For polyfilling async/await -> needs to be installed in terminal 1st

const { async } = require('q');

// if (module.hot) {
//   module.hot.accept();
// }
// https://forkify-api.herokuapp.com/v2 // => API docs

///////////////////////////////////////

// console.log(`Test`);

const controlRecipes = async function () {
  try {
    // Getting ID of recipe from hash value
    const id = window.location.hash.slice(1); // Need to slice cz the hash is returned starting w/ '#' symbol -> needs to be removed to conform w/ how api works
    // console.log(id);

    // Guard clause to protect against an empty string in place of a hash value
    if (!id) return;

    recipeView.renderSpinner();

    // 0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage()); // Works w/ both render and update() but update more efficient. As recipe clicked, hash value in url changes and is compared to id of current recipe. when equal, it will re-render search results and add a class to the a tag that has the id that matches the hash

    // 1. Update bookmarks view
    bookmarksView.render(model.state.bookmarks); // render instead of update cz bookmarks are rendered inside of a hidden panel, so no flickering will occur when performing the action. To use update, you would need to add a handler to bookmarksView.js to render bookmarks on page load before the recipe is rendered, therefore allowing update to perform its signature comparison. W/ this, update() would be comparing DOM elements with elements that weren't rendered yet (bookmarks)

    // 2. Loading recipe
    await model.loadRecipe(id); // loadRecipe is async funtion therefore will return a promise(however, it doesnt return anything therefore doesnt need to be stored in a variable). 1 async function calling another.
    // const { recipe } = model.state; // Destructured, otherwise would be: recipe = model.state.recipe

    // 3. Render the recipe
    // If we exported the class from recipeView.js; you would have to type the following to render the recipe:
    // const recipeView = new RecipeView (model.state.recipe)
    // Cleaner and more descriptive to make use of the following render() method:
    recipeView.render(model.state.recipe); // model.state.recipe is the data we recieved from step 1. That data is passed into the render method. render() takes it and stores it in a variable

    // TEST
    // controlServings();
  } catch (err) {
    bookmarksView.renderError();
    recipeView.renderError(); // error re thrown in model so that it can be propogated down here. Gives us acces to any error that may occur in the loadRecipe function
    console.error(err);
  }
};

// controlRecipes();

// Listening for hash event. This is an event on the window where the value after the url chnages when the recipe changes. Much like different urls for different pages of a website. When that hash event is fired, we want the recipe to be displayed for the corresponf=ding recipe id that will be derived from the hash value
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes); // Listeneing for load cz else if url copied w/ hash, recipe will not be displayed
// Better way of listening for 2 seperate events where you want to call the same eventListener
// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipes)
// );
// Dont want eventListeners in controller cz it has to do w/ the DOM manipulation. BUT, the eventListeners make use of controlRecipes function which is a part of the controller

// Search results
// Will call async function loadSearchResults, therefore this will also have to be an async function itself
// To make this work, we need to listen for click on button after which we will call this function. Will be done using pub/sub pattern
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    console.log(resultsView);

    // 1. Get search query
    const query = searchView.getQuery(); // Accessing method in searchView.js
    if (!query) return; //Guard clause

    // 2. Load search results
    await model.loadSearchResults(query); // Result not stored anywhere cz like loadRecipe, loadSearchResults doesnt return anything, all it does is manipulate the state

    // 3. Render results
    // console.log(model.state.search.results);
    // resultsView.render(model.state.search.results); // For all results
    resultsView.render(model.getSearchResultsPage());

    // 4. Render initial pagenation
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

// Controller executed whenever a click on a button occurs
const controlPagination = function (gotoPage) {
  // console.log(gotoPage);
  // Code below is simply copied from controlSearchResults

  // 1. Render NEW results
  resultsView.render(model.getSearchResultsPage(gotoPage)); // Render OVERRIDES the markup that was there previously becuase of the _clear method in render()

  // 2. Render NEW pagenation (renders the new buttons)
  paginationView.render(model.state.search); // This value is automatically updated in model
};

// Updating serving sizes
// Executed when user clicks on buttons to either increase or decrease serving size
const controlServings = function (newServings) {
  // Update recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view (the view that will be affected by updating the servings)
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe); // Difference btw update() & render() => update only re-renders text and attibutes in the DOM w/o re-rendering entire View -> this will help app's performance cz image doesnt need to be reloaded every time you update servings
};

// Controller for adding a new bookmark
const controlAddBookmark = function () {
  // 1. Adding/removing bookmark
  if (model.state.recipe.bookmarked) {
    model.deleteBookmark(model.state.recipe.id); // .id cz you are passing only the id into the deleteBookmark function
    // console.log(`remove`, model.state);
  } else {
    // model deals w/ the code behind the scenes -> state object => adds current recipe as bookmark
    model.addBookmark(model.state.recipe);
    // console.log(`add`, model.state);
  }

  // 2. update recipeView
  // Have to re-render recipe if we wnat the bookmark icon to change -> update alogorithm good fit
  recipeView.update(model.state.recipe);

  // 3. Rendering bookmarksView
  bookmarksView.render(model.state.bookmarks); // This is why we stores all data about bookmarks in bookmarks array -> allows for ease of use in future in cases like this where we want to render specific recipes agian in another location
};

// Used if you make use of update() for bookmarks from localstorage in controlRecipes
// const controlBookmarks = function () {
//   bookmarksView.render(model.state.bookmarks);
// };

// Also pub/sub
const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload newRecipe data
    await model.uploadRecipe(newRecipe); // Need to handle this function as a function that returns a promise cz it is an async function so that any rejected promise can be caught by the catch block in this function
    // console.log(model.state.recipe);

    // Render the newly created recipe
    recipeView.render(model.state.recipe);

    // Display success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change the id in the url -> When we create a new recipe, the hash code in the url does not change to that of the newly created recipe. Need to make use of the history api
    window.history.pushState(null, '', `#${model.state.recipe.id}`); // Allows you to change the url w/o reloading the page. pushState is a method available on history api which takes in 3 args
    // console.log(`#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SECONDS * 1000);
  } catch (err) {
    console.error(`💥💥💥: ${err}`);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log(`Welcome to the app!`);
};

// Pub/sub pattern
const init = function () {
  // bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes); // controlRecipes is essentially just a handler that is called when some event happens
  recipeView.addHandlerServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults); // controlSearchResults also just a handler
  paginationView._addHandlerClick(controlPagination); // controlPagination also just a handler
  addRecipeView._addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
