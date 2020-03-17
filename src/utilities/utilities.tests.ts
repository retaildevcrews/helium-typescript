import { assert } from "chai";
import { QueryUtilities, DateUtilities, VersionUtilities, ValidationUtilities } from ".";
import {
  invalidActorIDMessage,
  invalidGenreMessage,
  invalidMovieIDMessage,
  invalidPageNumberMessage,
  invalidPageSizeMessage,
  invalidQSearchMessage,
  invalidRatingMessage,
  invalidYearMessage
} from "../config/constants"

describe("QueryUtilities", () => {
  describe("getPartitionKey", () => {
    it("should return the right type", () => {
      assert.typeOf(QueryUtilities.getPartitionKey("nm1234"), "string");
    });

    it("should return the right partition key", () => {
      assert.equal(QueryUtilities.getPartitionKey("nm1234"), "4");
      assert.equal(QueryUtilities.getPartitionKey("tt1234"), "4");
      assert.equal(QueryUtilities.getPartitionKey("tttttt"), "0");
      assert.equal(QueryUtilities.getPartitionKey("Action"), "0");
      assert.equal(QueryUtilities.getPartitionKey("tt1"), "0");
    });
  })
});

describe("DateUtilities", () => {
  describe("getTimer", () => {
    it("should return correct type", () => {
      assert.typeOf(DateUtilities.getTimer(), "function");
    });
  });
  describe("getDurationMS", () => {
    it("should return correct type", () => {
      assert.typeOf(DateUtilities.getDurationMS([1800216, 25]), "string");
    });
    it("should return correct duration", () => {
      assert.equal(DateUtilities.getDurationMS([1800216, 25]), "1800216000");
    });
  });
});

describe("VersionUtilities", () => {
  describe("getBuildVersion", () => {
    it("should return correct type", () => {
      // expect(VersionUtilities.getBuildVersion()).toEqual(expect.any(String));
      assert.typeOf(VersionUtilities.getBuildVersion(), "string");
    });
  });
});

describe("ValidationUtilities", () => {
  describe("validateMovieId", () => {
    it("should validate movie ID tt333344", () => {
      const { validated, message } = ValidationUtilities.validateMovieId("tt333344");
      assert.isTrue(validated);
      assert.isEmpty(message);
    });

    it("should invalidate TT333344 (uppercase prefix)", () => {
      const { validated, message } = ValidationUtilities.validateMovieId("TT333344");
      assert.isFalse(validated);
      assert.equal(message, invalidMovieIDMessage);
    });

    it("should invalidate nm333344 (incorrect prefix)", () => {
      const { validated, message } = ValidationUtilities.validateMovieId("nm333344");
      assert.isFalse(validated);
      assert.equal(message, invalidMovieIDMessage);
    });

    it("should invalidate tt (too short)", () => {
      const { validated, message } = ValidationUtilities.validateMovieId("tt");
      assert.isFalse(validated);
      assert.equal(message, invalidMovieIDMessage);
    });

    it("should invalidate tttttttttttt (too long)", () => {
      const { validated, message } = ValidationUtilities.validateMovieId("tttttttttttt");
      assert.isFalse(validated);
      assert.equal(message, invalidMovieIDMessage);
    });

    it("should invalidate ttabcdef (non-numeric after first 2 characters)", () => {
      const { validated, message } = ValidationUtilities.validateMovieId("ttabcdef");
      assert.isFalse(validated);
      assert.equal(message, invalidMovieIDMessage);
    });
  });

  describe("validateActorId", () => {
    it("should validate nm333344", () => {
      const { validated, message } = ValidationUtilities.validateActorId("nm333344");
      assert.isTrue(validated);
      assert.isEmpty(message);
    });

    it("should invalidate NM333344 (upper case)", () => {
      const { validated, message } = ValidationUtilities.validateActorId("NM333344");
      assert.isFalse(validated);
      assert.equal(message, invalidActorIDMessage);
    });

    it("should invalidate tt333344 (incorrect prefix)", () => {
      const { validated, message } = ValidationUtilities.validateActorId("tt333344");
      assert.isFalse(validated);
      assert.equal(message, invalidActorIDMessage);
    });

    it("should invalidate nm (too short)", () => {
      const { validated, message } = ValidationUtilities.validateActorId("nm");
      // expect(result.validated).toEqual(false);
      assert.isFalse(validated);
      assert.equal(message, invalidActorIDMessage);
    });

    it("should invalidate tttttttttttt (too long)", () => {
      const { validated, message } = ValidationUtilities.validateActorId("tttttttttttt");
      // expect(result.validated).toEqual(false);
      assert.isFalse(validated);
      assert.equal(message, invalidActorIDMessage);
    });

    it("should invalidate nmabcdef (non-numeric after first 2 characters)", () => {
      const { validated, message } = ValidationUtilities.validateActorId("nmabcdef");
      assert.isFalse(validated);
      assert.equal(message, invalidActorIDMessage);
    });
  });

  describe("validateCommon", () => {
    it("should validate with no parameters", () => {
      const { validated, message } = ValidationUtilities.validateCommon({});
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should validate with a valid q parameter", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ q: "valid" });
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should validate with a valid pageNumber parameter", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ pageNumber: "100" });
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should validate with a valid pageSize parameter", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ pageSize: "200" });
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should invalidate when q parameter is too long", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ q: "this query is too long" });
      assert.isFalse(validated);
      assert.equal(message, invalidQSearchMessage);
    });

    it("should invalidate when q parameter is too short", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ q: "a" });
      assert.isFalse(validated);
      assert.equal(message, invalidQSearchMessage);
    });

    it("should invalidate when pageNumber parameter cannot parse to an integer", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ pageNumber: "number" });
      assert.isFalse(validated);
      assert.equal(message, invalidPageNumberMessage);
    });

    it("should invalidate when pageNumber parameter is too large", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ pageNumber: "20000" });
      assert.isFalse(validated);
      assert.equal(message, invalidPageNumberMessage);
    });

    it("should invalidate when pageNumber parameter is too small", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ pageNumber: "0" });
      assert.isFalse(validated);
      assert.equal(message, invalidPageNumberMessage);
    });

    it("should invalidate when pageSize parameter cannot parse to an integer", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ pageSize: "size" });
      assert.isFalse(validated);
      assert.equal(message, invalidPageSizeMessage);
    });

    it("should invalidate when pageSize parameter is too large", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ pageSize: "2000" });
      assert.isFalse(validated);
      assert.equal(message, invalidPageSizeMessage);
    });

    it("should invalidate when pageSize parameter is too small", () => {
      const { validated, message } = ValidationUtilities.validateCommon({ pageSize: "0" });
      assert.isFalse(validated);
      assert.equal(message, invalidPageSizeMessage);
    });
  });

  describe("validateMovies", () => {
    it("should validate with no parameters", () => {
      const { validated, message } = ValidationUtilities.validateMovies({});
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should validate with a valid genre", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ genre: "action" });
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should validate with a valid year", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ year: "1999" });
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should validate with a valid rating", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ rating: "9.3" });
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should validate with a valid actorId", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ actorId: "nm123345" });
      assert.isTrue(validated);
      assert.isUndefined(message);
    });

    it("should invalidate with invalid q parameter", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ q: "a" });
      assert.isFalse(validated);
      assert.equal(message, invalidQSearchMessage);
    });

    it("should invalidate with invalid pageNumber parameter", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ pageNumber: "0" });
      assert.isFalse(validated);
      assert.equal(message, invalidPageNumberMessage);
    });

    it("should invalidate with invalid pageSize parameter", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ pageSize: "size" });
      assert.isFalse(validated);
      assert.equal(message, invalidPageSizeMessage);
    });

    it("should invalidate with invalid genre parameter (undefined)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ genre: undefined });
      assert.isFalse(validated);
      assert.equal(message, invalidGenreMessage);
    });

    it("should invalidate with invalid genre parameter (too long)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ genre: "this is too long for a genre" });
      assert.isFalse(validated);
      assert.equal(message, invalidGenreMessage);
    });

    it("should invalidate with invalid genre parameter (too short)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ genre: "ge" });
      assert.isFalse(validated);
      assert.equal(message, invalidGenreMessage);
    });

    it("should invalidate with invalid year parameter (won't parse to an integer)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ year: "year" });
      assert.isFalse(validated);
      assert.equal(message, invalidYearMessage);
    });

    it("should invalidate with invalid year parameter (too large)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ year: "3060" });
      assert.isFalse(validated);
      assert.equal(message, invalidYearMessage);
    });

    it("should invalidate with invalid year parameter (too small)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ year: "1870" });
      assert.isFalse(validated);
      assert.equal(message, invalidYearMessage);
    });

    it("should invalidate with invalid rating parameter (won't parse to an integer)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ rating: "rating" });
      assert.isFalse(validated);
      assert.equal(message, invalidRatingMessage);
    });

    it("should invalidate with invalid rating parameter (too large)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ rating: "12.34" });
      assert.isFalse(validated);
      assert.equal(message, invalidRatingMessage);
    });

    it("should invalidate with invalid rating parameter (too small)", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ rating: "-1" });
      assert.isFalse(validated);
      assert.equal(message, invalidRatingMessage);
    });

    it("should invalidate with invalid actorId parameter", () => {
      const { validated, message } = ValidationUtilities.validateMovies({ actorId: "actor" });
      assert.isFalse(validated);
      assert.equal(message, invalidActorIDMessage);
    });
  });
});
