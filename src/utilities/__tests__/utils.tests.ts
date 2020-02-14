import { QueryUtilities } from "../queryUtilities";
import { DateUtilities } from "../dateUtilities";
import { IsEqualToProperty } from "../validationUtilities";
import { VersionUtilities } from "../versionUtilities";

test("Get partition key", () => {
  expect(QueryUtilities.getPartitionKey("nm1234")).toEqual(expect.any(String));
  expect(QueryUtilities.getPartitionKey("nm1234")).toBe("4");
  expect(QueryUtilities.getPartitionKey("tt1234")).toBe("4");
  expect(QueryUtilities.getPartitionKey("tt1")).toBe("0");
});

test("Get Timings", () => {
  expect(DateUtilities.getTimer()).toEqual(expect.any(Function));
  expect(DateUtilities.getDurationMS([ 1800216, 25 ])).toEqual(expect.any(String));
  expect(DateUtilities.getDurationMS([ 1800216, 25 ])).toBe("1800216000");
});

test("Get Validation", () => {
  expect(IsEqualToProperty("hello")).toEqual(expect.any(Function));
 });

test("Get Build Version", () => {
  expect(VersionUtilities.getBuildVersion()).toEqual(expect.any(String));
 });