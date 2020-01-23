import { QueryUtilities } from "../queryUtilities";

test("Get partition key", () => {
  expect(QueryUtilities.getPartitionKey("tt1234")).toBe("4");
});
