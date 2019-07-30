// Global app controller
//import str from './models/Search'; //importing the default export from Search
//import { add as a, multiply as m, ID } from './views/searchView'; //importing desired exports from searchView
//import * as searchView from './views/searchView'; //import everything from searchView
//console.log(`Using imported functions! ${searchView.add(ID, 2)} and ${searchView.multiply(3, 5)}. ${str}`);

import Search from './models/Search';
import * as searchView from './views/searchView';
import Recipe from './models/Recipe';
import { elements, renderLoader, clearLoader } from './views/base';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import List from './models/List';
import Likes from './models/Likes';



/* Global state of the app
Search object
Current recipe object
Shopping list object
Liked recipes
*/
const state = {};

// Search CONTROLLER:
const controlSearch = async() => {
    //1. Get query from view
    const query = searchView.getInput();
    //console.log(query);
    
    if(query) {
        //2. New search object and add to state
        state.search = new Search(query);
        
        //3. Prepare UI for results
        searchView.clearInput(); //clear the search bar
        searchView.clearResults(); //clear the results
        renderLoader(elements.searchRes);

        try {
        //4. Search for recipes
        await state.search.getResults(); //must await the promise 

        //5. Render results on the UI
        //console.log(state.search.result);
        clearLoader();
        searchView.renderResults(state.search.result);
        }
        catch (error) {
            console.log('Something went wrong with the search.');
            clearLoader();
        }
    }
}
elements.searchForm.addEventListener('submit', e => { //event listener when submitting the recipe
    e.preventDefault(); 
    controlSearch();
});


elements.searchResPages.addEventListener('click', e=> {
    const btn = e.target.closest('.btn-inline'); //finds the closest button class, not the span or img
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); //shows the dataset of the button, what is the value inside the goto
        searchView.clearResults(); //clear the results
        searchView.renderResults(state.search.result, goToPage);
    }
});

//RECIPE CONTROLLER

const controlRecipe = async () => {
    //get ID from url
    const id = window.location.hash.replace('#', ''); //make the hash tag invisible

    if (id) {
        //1- Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        //2- Create new recipe object
        state.recipe = new Recipe(id);
        
        try {
        //3- Get recipe data and parse ingredients
        await state.recipe.getRecipe(); 
        //console.log(state.recipe.ingredients);
        state.recipe.parseIngredients();

        //4- Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        //5- Render Recipe
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
        ); 
        }
        catch (error) {
            console.log(error);
            console.log('Error processing request');
        }
    }
};
    
    ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



//LIST CONTROLLER 

const controlList = () => {
    //1- create new list if there's none yet
    if(!state.list) state.list = new List();

    //2- Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
    
};
//Handling delete and udpate list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid; //goes to the closest shopping item relative to where we clicked and access the data and id

    //delete btn
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);
        //delete from UI
        listView.deleteItem(id);
    }
    else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

//LIKES Controller

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    if (!state.likes.isLiked(currentID)) { //user hasn't liked current recipe
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //toggle the like button
        likesView.toggleLikeBtn(true);
        //add like to UI list
        likesView.renderLike(newLike);
    }
    else { //user has liked current recipe
        //remove like from state
        state.likes.deleteLike(currentID);
        //toggle the like button
        likesView.toggleLikeBtn(false);
        //remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Restore liked recipes on page load 
window.addEventListener('load', () => {
    state.likes = new Likes();
    //restore likes
    state.likes.readStorage();
    //toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease button has been clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //increase button has been clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
    else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
    
});


