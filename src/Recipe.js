import axios from 'axios';
import { key, proxy } from '../config';


export default class Recipe { //Lecture 146
    constructor (id) {
        this.id = id;
    }
    async getRecipe() {
        try {
            const res = await axios(`${proxy}https://food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }
        catch (error) {
            console.log(error);
            alert('Something went wrong');
        }
    }
    calcTime() { //calculates the time to prepare the recipe in minutes
        //15 minutes for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15; 
    } 

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() { //function to make ingredients all uniform/clear
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        const newIngredients = this.ingredients.map(el => {
            //1- Uniform the units
            let ingredient = el.toLowerCase(); //converting string to lower case
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            //2- Remove the parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            //3- Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' '); 
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            let objIng;
            if (unitIndex > -1) { //there's a unit
                const arrCount = arrIng.slice(0, unitIndex); // 4 1/2 cups, arrCount is [4, 1/2], eval("4+1/2") -> 4.5
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                }
                else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count, 
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
            }
            else if (parseInt(arrIng[0], 10)) { //there's no unit, but the 1st element's a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }
            else if (unitIndex === -1) { //there's no unit and 1st element isnt a number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }


            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) { //Lecture 151
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        
        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}