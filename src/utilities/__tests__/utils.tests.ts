import { QueryUtilities } from "../queryUtilities";
import { DateUtilities } from "../dateUtilities";
import { VersionUtilities } from "../versionUtilities";
import { ValidationUtilities } from "../validationUtilities";
import {
  invalidActorIDMessage, invalidGenreMessage, invalidMovieIDMessage, 
  invalidPageNumberMessage, invalidPageSizeMessage, invalidQSearchMessage, 
  invalidRatingMessage, invalidYearMessage
} from "../../config/constants"

describe("Query Utilities", () => {
  test("Get partition key", () => {
    expect(QueryUtilities.getPartitionKey("nm1234")).toEqual(expect.any(String));
    expect(QueryUtilities.getPartitionKey("nm1234")).toBe("4");
    expect(QueryUtilities.getPartitionKey("tt1234")).toBe("4");
    expect(QueryUtilities.getPartitionKey("tttttt")).toBe("0");
    expect(QueryUtilities.getPartitionKey("Action")).toBe("0");
    expect(QueryUtilities.getPartitionKey("tt1")).toBe("0");
  });
});

describe("Date Utilities", () => {
  test("Get Timings", () => {
    expect(DateUtilities.getTimer()).toEqual(expect.any(Function));
    expect(DateUtilities.getDurationMS([ 1800216, 25 ])).toEqual(expect.any(String));
    expect(DateUtilities.getDurationMS([ 1800216, 25 ])).toBe("1800216000");
  });
});

describe("Version Utilities", () => {
  test("Get Build Version", () => {
    expect(VersionUtilities.getBuildVersion()).toEqual(expect.any(String));
  });
});

describe("Validation Utilities", () => {
  describe("Validate MovieId", () => {
    test("Valid MovieId Parameter", () => {
      const result = ValidationUtilities.validateMovieId("tt333344");
      expect(result.validated).toEqual(true);
      expect(result.message).toEqual("");
    });

    test("Invalid MovieId Parameters", () => {
        // Uppercase prefix
        let result = ValidationUtilities.validateMovieId("TT333344");
        expect(result.validated).toEqual(false);
        expect(result.message).toEqual(invalidMovieIDMessage);
        result.message = undefined;

        // Incorrect prefix
        result = ValidationUtilities.validateMovieId("nm333344");
        expect(result.validated).toEqual(false);
        expect(result.message).toEqual(invalidMovieIDMessage);
        result.message = undefined;

        // Invalid length (too short)
        result = ValidationUtilities.validateMovieId("tt");
        expect(result.validated).toEqual(false);
        expect(result.message).toEqual(invalidMovieIDMessage);
        result.message = undefined;

        // Invalid length (too long)
        result = ValidationUtilities.validateMovieId("tttttttttttt");
        expect(result.validated).toEqual(false);
        expect(result.message).toEqual(invalidMovieIDMessage);
        result.message = undefined;

        // Non-numeric after first 2 characters
        result = ValidationUtilities.validateMovieId("ttabcdef");
        expect(result.validated).toEqual(false);
        expect(result.message).toEqual(invalidMovieIDMessage);
    });
  });

  describe("Validate ActorId", () => {
    test("Valid ActorId Parameter", () => {
      const result = ValidationUtilities.validateActorId("nm333344");
      expect(result.validated).toEqual(true);
      expect(result.message).toEqual("");
    });

    test("Invalid ActorId Parameters", () => {
      // Uppercase prefix
      let result = ValidationUtilities.validateActorId("NM333344");
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidActorIDMessage);
      result.message = undefined;
  
      // Incorrect prefix
      result = ValidationUtilities.validateActorId("tt333344");
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidActorIDMessage);
      result.message = undefined;
  
      // Invalid length (too short)
      result = ValidationUtilities.validateActorId("nm");
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidActorIDMessage);
      result.message = undefined;
  
      // Invalid length (too long)
      result = ValidationUtilities.validateActorId("tttttttttttt");
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidActorIDMessage);
      result.message = undefined;
  
      // Non-numeric after first 2 characters
      result = ValidationUtilities.validateActorId("nmabcdef");
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidActorIDMessage);
    });
  });

  describe("Validate Common", () => {
    test("Valid Common Parameters", () => {
      // Absent common parameters (q, pageSize, pageNumber) is valid
      let result = ValidationUtilities.validateCommon({});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();

      // Valid q string
      result = ValidationUtilities.validateCommon({q: "valid"});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();

      // Valid pageNumber parameter
      result = ValidationUtilities.validateCommon({pageNumber: "100"});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();

      // Valid pageSize parameter
      result = ValidationUtilities.validateCommon({pageSize: "200"});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();
    });

    test("Invalid q (Search) Parameters", () => {
      // Invalid length (too long)
      let result = ValidationUtilities.validateCommon({q: "this query is too long"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidQSearchMessage);

      // Invalid length (too short)
      result = ValidationUtilities.validateCommon({q: "a"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidQSearchMessage);
      result.message = undefined;      
    });

    test("Invalid PageNumber Parameters", () => {
      // Must parse to integer
      let result = ValidationUtilities.validateCommon({pageNumber: "number"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidPageNumberMessage);
      result.message = undefined;

      // Out of range (too large)
      result = ValidationUtilities.validateCommon({pageNumber: "20000"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidPageNumberMessage);
      result.message = undefined;

      // Out of range (too small)
      result = ValidationUtilities.validateCommon({pageNumber: "0"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidPageNumberMessage);
    });

    test("Invalid PageSize Parameters", () => {
      // Must parse to integer
      let result = ValidationUtilities.validateCommon({pageSize: "size"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidPageSizeMessage);
      result.message = undefined;

      // Out of range (too large)
      result = ValidationUtilities.validateCommon({pageSize: "2000"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidPageSizeMessage);
      result.message = undefined;

      // Out of range (too small)
      result = ValidationUtilities.validateCommon({pageSize: "0"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidPageSizeMessage);
    });
  });

  describe("Validate Movies", () => {
    test("Valid Movie Parameters", () => {
      // No movie parameters (genre, year, rating, actorId) is valid
      let result = ValidationUtilities.validateMovies({});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();

      // Valid genre parameter
      result = ValidationUtilities.validateMovies({genre: "action"});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();

      // Valid year parameter
      result = ValidationUtilities.validateMovies({year: "1999"});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();

      // Valid rating parameter
      result = ValidationUtilities.validateMovies({rating: "9.3"});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();

      // Valid actorId parameter
      result = ValidationUtilities.validateMovies({actorId: "nm123345"});
      expect(result.validated).toEqual(true);
      expect(result.message).toBeUndefined();
    });

    test("Invalid Common Movie Parameters", () => {
      // Invalid q (search) parameter
      let result = ValidationUtilities.validateMovies({q: "a"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidQSearchMessage);
      result.message = undefined;

      // Invalid pageNumber parameter
      result = ValidationUtilities.validateMovies({pageNumber: "0"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidPageNumberMessage);
      result.message = undefined;

      // Invalid pageSize parameter
      result = ValidationUtilities.validateMovies({pageSize: "size"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidPageSizeMessage);
    });

    test("Invalid Genre Parameters", () => {
      // Undefined
      let result = ValidationUtilities.validateMovies({genre: undefined});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidGenreMessage);
      result.message = undefined;

      // Invalid length (too long)
      result = ValidationUtilities.validateMovies({genre: "this is too long for a genre"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidGenreMessage);
      result.message = undefined;

      // Invalid length (too short)
      result = ValidationUtilities.validateMovies({genre: "ge"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidGenreMessage);
    });

    test("Invalid Year Parameters", () => {
      // Must parse to integer
      let result = ValidationUtilities.validateMovies({year: "year"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidYearMessage);
      result.message = undefined;

      // Out of range (too large)
      result = ValidationUtilities.validateMovies({year: "3060"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidYearMessage);
      result.message = undefined;

      // Out of range (too small)
      result = ValidationUtilities.validateMovies({year: "1870"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidYearMessage);
    });

    test("Invalid Rating Parameters", () => {
      // Must parse to integer
      let result = ValidationUtilities.validateMovies({rating: "rating"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidRatingMessage);
      result.message = undefined;

      // Out of range (too large)
      result = ValidationUtilities.validateMovies({rating: "12.34"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidRatingMessage);
      result.message = undefined;

      // Out of range (too small)
      result = ValidationUtilities.validateMovies({rating: "-1"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidRatingMessage);
    });

    test("Invalid ActorId Parameter", () => {
      // Invalid actorId parameter
      const result = ValidationUtilities.validateMovies({actorId: "actor"});
      expect(result.validated).toEqual(false);
      expect(result.message).toEqual(invalidActorIDMessage);
    });

  });
});
