// import "reflect-metadata";
// import { mockery } from "mockery";
// // import { CosmosClient } from "@azure/cosmos";
// import { CosmosDBService } from "./CosmosDBService";
// // import { assert } from "chai";
// // import { ConsoleLogService } from "./ConsoleLogService";

// // jest.mock("@azure/cosmos");

// // it("Check cosmos client dependency", () => {
// //     new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);

// //     expect(CosmosClient).toHaveBeenCalledTimes(1);
// // });
// let CosmosClient;
// before(() => {
//     mockery.enable();
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     CosmosClient = require("@azure/cosmos");
    
// });

// describe("Query Actors", () => {
//     // it("Expected output", async () => {
//     //     const query = new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null;
//     //     query.queryDocuments = jest.fn().mockResolvedValue(["Lawrence Fishburn"]);
//     //     expect(query.queryActors({})).resolves.toEqual(["Lawrence Fishburn"]);

//     // });

//     //     it("Expected SQL statement given the argument", () => {

//     //         const query = new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);
//     //         // query.queryDocuments = jest.fn();

//         test("Default params sent to DB", () => {
//             query.queryActors({});
//             const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.textSearch, m.actorId offset 0 limit 100 ";

//     //             expect(query.queryDocuments).toBeCalledWith(call);
//     //         });

//         test("Params with Actor", () => {
//             query.queryActors({ q: "Lawrence Fisburn" });
//             const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  and contains(m.textSearch, 'lawrence fisburn') order by m.textSearch, m.actorId offset 0 limit 100 ";

//     //             expect(query.queryDocuments).toBeCalledWith(call);
//     //         });

//         test("Params with PageSize and PageNumber", () => {
//             query.queryActors({ pageSize: 20, pageNumber: 20 });
//             const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.textSearch, m.actorId offset 380 limit 20 ";

//     //             expect(query.queryDocuments).toBeCalledWith(call);
//     //         });

//         test("Params with PageSize < 0", () => {
//             query.queryActors({ pageSize: 0, pageNumber: 1 });
//             const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.textSearch, m.actorId offset 0 limit 100 ";

//     //             expect(query.queryDocuments).toBeCalledWith(call);
//     //         });

//         test("Params with PageSize > maxPageSize", () => {
//             query.queryActors({ pageSize: 1001, pageNumber: 20 });
//             const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.textSearch, m.actorId offset 19000 limit 1000 ";

//     //             expect(query.queryDocuments).toBeCalledWith(call);
//     //         });

//         test("Params with PageNumber <  0", () => {
//             query.queryActors({ pageSize: 1001, pageNumber: -20 });
//             const call = "select m.id, m.partitionKey, m.actorId, m.type, m.name, m.birthYear, m.deathYear, m.profession, m.textSearch, m.movies from m where m.type = 'Actor'  order by m.textSearch, m.actorId offset 0 limit 1000 ";

//     //             expect(query.queryDocuments).toBeCalledWith(call);
//     //         });
//     //     });

//     // });

//     // describe("Query Movies", () => {
//     //     it("Expected output", () => {
//     //         const query = new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);
//     //         // query.queryDocuments = jest.fn().mockResolvedValue(["The Matrix"]);

//     //         expect(query.queryMovies({})).resolves.toEqual(["The Matrix"]);
//     //     });

//     //     describe("Expected SQL statement given the argument", () => {
//     //         const query = new CosmosDBService("http://www.db.com", "dbkey", "db", "collection", null);
//     //         // query.queryDocuments = jest.fn();

//     //         it("Default params sent to DB", () => {
//     //             query.queryMovies({});
//     //             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.title offset 0 limit 100 ";

//         test("Default params sent to DB", () => {
//             query.queryMovies({});
//             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.textSearch, m.movieId offset 0 limit 100 ";

//     //         it("Params with pageSize < 0", () => {
//     //             query.queryMovies({pageSize: 0, pageNumber: 20});
//     //             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.title offset 1900 limit 100 ";

//         test("Params with pageSize < 0", () => {
//             query.queryMovies({ pageSize: 0, pageNumber: 20 });
//             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.textSearch, m.movieId offset 1900 limit 100 ";

//     //         it("Params with pageSize > maxPageSize", () => {
//     //             query.queryMovies({pageSize: 1001, pageNumber: 20});
//     //             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.title offset 19000 limit 1000 ";

//         test("Params with pageSize > maxPageSize", () => {
//             query.queryMovies({ pageSize: 1001, pageNumber: 20 });
//             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.textSearch, m.movieId offset 19000 limit 1000 ";

//     //         it("Params with pageNumber < 0", () => {
//     //             query.queryMovies({pageSize: 1001, pageNumber: -20});
//     //             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.title offset 0 limit 1000 ";

//         test("Params with pageNumber < 0", () => {
//             query.queryMovies({ pageSize: 1001, pageNumber: -20 });
//             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  order by m.textSearch, m.movieId offset 0 limit 1000 ";

//     //         it("Params with a query", () => {
//     //             query.queryMovies({q: "The Sequel"});
//     //             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and contains(m.textSearch, 'the sequel')  order by m.title offset 0 limit 100 ";

//         test("Params with a query", () => {
//             query.queryMovies({ q: "The Sequel" });
//             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and contains(m.textSearch, 'the sequel')  order by m.textSearch, m.movieId offset 0 limit 100 ";

//     //         it("Params with a year", () => {
//     //             query.queryMovies({year: "1998"});
//     //             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and m.year = 1998  order by m.title offset 0 limit 100 ";

//         test("Params with a year", () => {
//             query.queryMovies({ year: "1998" });
//             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and m.year = 1998  order by m.textSearch, m.movieId offset 0 limit 100 ";

//     //         it("Params with a rating", () => {
//     //             query.queryMovies({rating: 5});
//     //             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and m.rating >= 5  order by m.title offset 0 limit 100 ";

//         test("Params with a rating", () => {
//             query.queryMovies({ rating: 5 });
//             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and m.rating >= 5  order by m.textSearch, m.movieId offset 0 limit 100 ";

//     //         it("Params with a actorID", () => {
//     //             query.queryMovies({actorId: "nm0000401"});
//     //             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and array_contains(m.roles, { actorId: 'nm0000401' }, true)  order by m.title offset 0 limit 100 ";

//         test("Params with a actorID", () => {
//             query.queryMovies({ actorId: "nm0000401" });
//             const call = "select m.id, m.partitionKey, m.movieId, m.type, m.textSearch, m.title, m.year, m.runtime, m.rating, m.votes, m.totalScore, m.genres, m.roles from m where m.type = 'Movie'  and array_contains(m.roles, { actorId: 'nm0000401' }, true)  order by m.textSearch, m.movieId offset 0 limit 100 ";

//     // });

// });

// after(() => {
//     mockery.disable();
// });
