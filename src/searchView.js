
import { elements } from './base';

export const getInput = () => elements.searchInput.value;
export const clearInput = () => {
    elements.searchInput.value = '';
};
export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelector('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
};


/*
acc: 0, acc + cur.length = 6, newTitle = ['pizza'] 1st iteration
acc: 6, acc + cur.length = 11, newTitle = ['pizza', 'dough'] 2nd iteration
acc: 11, acc + cur.length = 16, newTitle = ['pizza, 'dough', 'nigga'] 3rd iteration
acc: 17, not iterated, too big
*/
export const limitRecipeTitle = (title, limit = 17) => { //limit the characters shown on the website
    const newTitle = [];
    if(title.length > limit) {
        title.split(' ').reduce((acc, cur) => { //acc is the total amount of characters already present, cur is the current string being passed in
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
        //return result: 
        return `${newTitle.join(' ')}...`; //return the array, which joins every element with spaces between elements.
    }
    return title;
};
const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link results__link--active" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup); //insert the HTML at the beforeend position, with the text being the markup
};

//type: 'prev' or 'next'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;
const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage); //how many pages we need

    let button;

    if (page === 1 && pages > 1) {
        //button to go to next page
        button = createButton(page, 'next');
    }
    else if (page < pages) {
        //button to go to next/prev page
        button = 
        `${createButton(page, 'prev')} 
         ${createButton(page, 'next')}
         `;
    }
    else if (page === pages && pages > 1) {
        //button to go to previous page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //Render results of current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);

    //Render page buttons
    renderButtons(page, recipes.length, resPerPage);
};