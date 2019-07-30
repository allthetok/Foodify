import axios from 'axios'; //axios is similar to fetch, but it works on much older web browsers
import { key, proxy } from '../config';
//API key - bd05529c1bfefa404ec8c6632de07897 

//First API Calls to retrieve recipes based on a keyword, Lecture 139
export default class Search {
    constructor (query) {
        this.query = query;
    }
    async getResults() {
        
        try {
        const res = await axios(`${proxy}https://food2fork.com/api/search?key=${key}&q=${this.query}`); //API call, finding the key and the search query, returns a promise
        this.result = res.data.recipes; //all recipes including the keyword pizza
        //console.log(this.result);

        }
        catch (error) {
            alert(error);
        }  
    }
}
