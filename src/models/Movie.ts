import { Actor } from "./Actor";

export class Movie {

    public id: string;
    public movieId: string;
    public title: string;
    public textSearch: string;
    public type: string;
    public partitionKey: string;
    public year?: number;
    public runtime?: number;
    public rating?: number;
    public votes?: number;
    public totalScore?: number;
    public genres?: string[];
    public roles?: Actor[];

    constructor(data?: any) {
        if (data) {
            this.id = data.id;
            this.movieId = data.movieId;
            this.title = data.title;
            this.textSearch = data.textSearch;
            this.type = data.type;
            this.partitionKey = data.partitionKey;
            this.year = data.year;
            this.runtime = data.runtime;
            this.rating = data.rating;
            this.votes = data.votes;
            this.totalScore = data.totalScore;
            this.genres = data.genres;
            this.roles = data.roles;
        }
    }
}
