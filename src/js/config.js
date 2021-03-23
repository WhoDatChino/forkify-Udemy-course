// File commonly used in projects that contain variables that should be constants and should be reused across the project
// Goal: allows us to easily configure the project by simply changing the data in this file
// Only variables here are ones that are important for defining some of the app data -> not ALL variables will be put in this file

// Url to Api -> used multiple times across project
// Named in capitals as it is a constant that will never change -> common practise in config files
export const API_URL = `https://forkify-api.herokuapp.com/api/v2/recipes/`;

export const TIMEOUT_SEC = 10; // Useful to have this in config cz if 10s just put into timeout function, someone reading the code will not know where that comes from, this gives it context

export const RES_PER_PAGE = 10;

export const API_KEY = `c61ebd12-f95f-4808-ab1f-219d7a23c726`;

export const MODAL_CLOSE_SECONDS = 2.5;
