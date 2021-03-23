// Module in which entire model will be written - refer to architecture diagram
// Business logic

// Imports from config file
// Can do them all at once but jonas preference to do one by one
import { API_URL } from './config.js';
import { RES_PER_PAGE } from './config.js';
import { API_KEY } from './config.js';

// Imports from helpers file
import { getJSON } from './helpers.js';
import { sendJSON } from './helpers.js';

// State contains ALL the DATA we need to build the app
export const state = {
  recipe: {},
  search: {
    query: '', // Good idea to store this for future use incase you want to make use of some analytics etc
    results: [],
    resultsPerPage: RES_PER_PAGE, // Stored in state cz this is an important part of the state of the app
    page: 1,
  },
  bookmarks: [],
};

// Refactored into a function as it is used more than once
const createRecipeObject = function (data) {
  // Reformatting the variables we get back from the api
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceURL: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), // Needs to be done cz most recipes wont have a key (this is our api key) cz its only avaialble on recipes we create and send to the api. Whats happening? - && short circuits so if recipe.key doesnt exist, nothing happens here. If recipe.key does exist, then the second part is executed and returned. Then the whole expression will become the object which we then need to spread so that it ends up being the same as the other properties. CONDITIONALLY ADDING PROPERTIES TO AN OBJECT
  };
};

// Controller will pass in the id when it calls this function
// This function will not return anything -> only acts to change the state object which will contain the recipe into from which the controller will later take the recipe out of. Works cz of live connection btw exports/imports
// This is not a pure function cz has side effect of manipulating the state.recipe variable
export const loadRecipe = async function (id) {
  try {
    const data = await getJSON(`${API_URL}/${id}?key=${API_KEY}`); // All old functionality abstarcted to helper file. Async function (loadRecipe) calling async function (getJSON) that returns a data variable. Data is the resolved promise that the getJson returns -> that is why we await the getJSON promise and store the resolved value in a variable

    state.recipe = createRecipeObject(data);

    // When we load the recipes, we need to check if there is a recipe w/ the same id as one w/ the bookmarked state set to true. If there is then we will mark the current recipe loaded from the api w/ bookmarked set to true
    // Make use of the bookmarks array to get info about what we previously bookmarked
    // if there is a bookmark id that is equal to the id we just recieved(recipe loading)
    if (state.bookmarks.some(bookm => bookm.id === id)) {
      state.recipe.bookmarked = true; //state.recipe is the current recipe
    } else state.recipe.bookmarked = false;

    // console.log(state.recipe);
  } catch (err) {
    // Temp error handling
    console.error(`---${err}--- :`);
    throw err; // Needs to be re-thrown as well so that we can have access to the error in the controller when we call the recipeView.renderError. Again propogating the error downwards
  }
};

// Search functionality
// Async function cz this function will be performing AJAX calls. Will be called by controller therefore cpntroller will tell this function what to search for
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query; // Filling in the query property of search object inside state object
    const data = await getJSON(`${API_URL}?search=${query}&key=${API_KEY}`); // ALWAYS REMEMBER THE AWAIT KEYWORD. Inserting api key so we know if the recipe is one we have previously created
    // console.log(data);

    // data.data.recipes is the array of recipes returned from the above AJAX call. Here we are mapping that array to return new objects w/ altered property names and returning them in a new array. We will add this data to the state variable
    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }), // Need to include the key when loading the search results so that we can have the persona icon for recipes created by users
      };
    });
    state.search.page = 1; // Resets current page to page 1 whenever a new recipe is searched for
  } catch (err) {
    console.error(`---${err}--- :`);
    throw err; // Throw error as well so that eventually you'll be able to use it in the controller
  }
};
// loadSearchResults('pizza');

// Pagenation
// Not an async function cz we already have the search results loaded at this point
export const getSearchResultsPage = function (page = state.search.page) {
  // Need to define this so that at any point in time we can know what page we're on in the search results. Defaults to 1
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  // Want to return just a part of the results
  return state.search.results.slice(start, end); // Remember that slice does not include the last value thats why end is *10
};

export const updateServings = function (newServings) {
  // This function wil reach into the state object, specifically into the ingredients array and change the quantity of each ingredient
  state.recipe.ingredients.forEach(ing => {
    // Could create a new array but doing it instead w/ side effects
    // newQt = oldQT * (newSS / oldSS)
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
  });

  // Updating servings after calc so that new servings can be carried over into state
  state.recipe.servings = newServings;
};

// Function to be called when adding or deleting a bookmark. Stores them to local storage
const persistBookmarks = function () {
  // Wrap local storage in try/catch as some users may have localStorage disabled in their browser settings
  try {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
  } catch (err) {
    console.error(err, "localStorage disabled, can't use bookmarks");
    throw new Error("LocalStorage disabled, can't use bookmarks");
  }
};

// Bookmarking recipes
// Function will recieve a recipe and then set that recipe as a bookmark. Adding a bookmark is pushing the recipe into the bookmark array in the state object
export const addBookmark = function (recipe) {
  // Add bookmark to array
  state.bookmarks.push(recipe);

  // Mark recipe as being a bookmark
  // - If recipe id of recipe passed into function is same as the one displayed, then set the bookmarked property (setting new property) to true
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  // Commiting to storage
  persistBookmarks();
};

// Removing bookmark
// Common practise in programming that when we get something we get all the data asscoiated w/ it as seen in addBookmark, but when we delete something we simply only get the id -> no need to get all the data again
export const deleteBookmark = function (id) {
  // Want to delete the recipe from the bookmarks array that has an id that matches the one passed into this function
  const index = state.bookmarks.findIndex(el => el.id === id); // returns index of recipe we want to remove
  state.bookmarks.splice(index, 1); // removes the element from the array

  // Mark recipe as NOT bookmarkwd
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // Commiting to storage
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
// console.log(state.bookmarks);

// const clearBookmarks = function(){
//   localStorage.clear('bookmarks')
// }
// clearBookmarks()

// Function to upload recipe to Api
// Async cz is dealing w/ the api
export const uploadRecipe = async function (newRecipe) {
  try {
    // console.log(newRecipe);
    // 1. Transforming newRecipe data and transforming into correct format
    // 1a. Converting data into array, then removing all arrays that dont have an 'ingredients' element
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            `Wrong ingredient format. Please use the correct format`
          );
        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };

        // Whats happening? - Converting the object recieved from constructor handler back into array of arrays. Filtering array down where the 1 element of the array contains the word 'ingredient' and if thats true, the 2nd element of that array must not be empty. Then loop over the new filtered array to create a new array where the 2nd element of the array has its whitespace removed and is split by the comma seperating the values. If the ingArr size is not equal to 3(means comma format for inputs not followed), then throw a new error that can propogated down to controller and caught there. Then destructure the new ingArr into 3 seperate variables. Return an object conatining the values of those variables. Change quantity to a number if it exists otherwise set it to null.
      });
    // console.log(ingredients);

    // This is the data that will be sent back to the api. Needs to be sent in the format as we recieve it from the api originally. We origianally formatted this data when we recieve it in the loadRecipe(). Essentially doing the opposite to loadRecipe()
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // console.log(recipe);

    // Sending data to api. Each api may be slightly different in how they accept POST requests. Make sure your url is correct
    const data = await sendJSON(`${API_URL}?key=${API_KEY}`, recipe); // if successful, will return an object w/ the data we sent it plus additional data like time created, our api key and an id for the recipe
    // console.log(data);
    state.recipe = createRecipeObject(data); // Creating a new recipe object again, this time w/ the data we recieved from the api

    // Adding newly created recipe to bookmarks
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
