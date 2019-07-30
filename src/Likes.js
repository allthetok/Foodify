export default class Likes {
    constructor() {
        this.likes = [];
    }
    addLike(id, title, author, img) {
       const like = { id, title, author, img };
       this.likes.push(like);
       this.persistData();
       return like; 
    }

    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id === id);
        //[2, 4, 8] splice (1, 1) -> return 4, [2,8]
        this.likes.splice(index, 1);
        this.persistData();
    }

    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes)); //transforming likes into string
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));
        //restoring likes from localStorage
        if (storage) this.likes = storage;
    }
}