import "reflect-metadata";
import { CosmosClient } from "@azure/cosmos";
import { CosmosDBService } from "./CosmosDBService";

jest.mock("@azure/cosmos");

test("Check cosmos client dependency", () => {
    new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);

    expect(CosmosClient).toHaveBeenCalledTimes(1);
});

describe("Query Actors", () => {
    test("Expected output", () => {
        const query = new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);
        query.queryDocuments = jest.fn().mockResolvedValue(["Lawrence Fishburn"]);

        expect(query.queryActors({})).resolves.toEqual(["Lawrence Fishburn"]);
    });

    describe("Expected SQL statement given the argument", () => {

        const query = new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);
        query.queryDocuments = jest.fn();

        test("Default params sent to DB", () => {
            query.queryActors({});
            const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.name offset 0 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with Actor", () => {
            query.queryActors({q: "Lawrence Fisburn"});
            const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  and contains(m.textSearch, 'lawrence fisburn') order by m.name offset 0 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with PageSize and PageNumber", () => {
            query.queryActors({pageSize: 20, pageNumber: 20});
            const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.name offset 380 limit 20 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with PageSize < 0", () => {
            query.queryActors({pageSize: 0, pageNumber: 1});
            const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.name offset 0 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with PageSize > maxPageSize", () => {
            query.queryActors({pageSize: 1001, pageNumber: 20});
            const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.name offset 19000 limit 1000 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with PageNumber <  0", () => {
            query.queryActors({pageSize: 1001, pageNumber: -20});
            const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.name offset 0 limit 1000 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });
    });

});

describe("Query Movies", () => {
    test("Expected output", () => {
        const query = new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);
        query.queryDocuments = jest.fn().mockResolvedValue(["The Matrix"]);

        expect(query.queryMovies({})).resolves.toEqual(["The Matrix"]);
    });

    describe("Expected SQL statement given the argument", () => {
        const query = new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);
        query.queryDocuments = jest.fn();

        test("Default params sent to DB", () => {
            query.queryMovies({});
            const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.title offset 0 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with pageSize < 0", () => {
            query.queryMovies({pageSize: 0, pageNumber: 20});
            const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.title offset 1900 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with pageSize > maxPageSize", () => {
            query.queryMovies({pageSize: 1001, pageNumber: 20});
            const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.title offset 19000 limit 1000 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with pageNumber < 0", () => {
            query.queryMovies({pageSize: 1001, pageNumber: -20});
            const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.title offset 0 limit 1000 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with a query", () => {
            query.queryMovies({q: "The Sequel"});
            const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and contains(m.textSearch, 'the sequel')  order by m.title offset 0 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with a year", () => {
            query.queryMovies({year: "1998"});
            const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and m.year = 1998  order by m.title offset 0 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with a rating", () => {
            query.queryMovies({rating: 5});
            const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and m.rating >= 5  order by m.title offset 0 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

        test("Params with a actorID", () => {
            query.queryMovies({actorId: "nm0000401"});
            const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and array_contains(m.roles, { actorId: 'nm0000401' }, true)  order by m.title offset 0 limit 100 ";

            expect(query.queryDocuments).toBeCalledWith(call);
        });

    });

});
