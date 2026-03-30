import { buildDateQueryParams, appendDateQuery } from "./dateQuery";

describe("buildDateQueryParams", () => {
  it("returns empty object when date is null", () => {
    expect(buildDateQueryParams(null)).toEqual({});
  });

  it("returns start/end params for a given date", () => {
    const result = buildDateQueryParams("2016-03-15");
    expect(result).toEqual({
      start: "2016-03-15T00:00:00.000Z",
      end: "2016-03-15T23:59:59.999Z",
    });
  });
});

describe("appendDateQuery", () => {
  it("returns the url unchanged when date is null", () => {
    const url = "https://api.example.com/reefs";
    expect(appendDateQuery(url, null)).toBe(url);
  });

  it("appends query params to a URL with no existing query string", () => {
    const url = "https://api.example.com/reefs";
    const result = appendDateQuery(url, "2016-03-15");
    expect(result).toContain("start=");
    expect(result).toContain("end=");
    expect(result).toContain("?");
  });

  it("appends query params with & when URL already has a query string", () => {
    const url = "https://api.example.com/reefs?region=au";
    const result = appendDateQuery(url, "2016-03-15");
    expect(result).toContain("region=au");
    expect(result).toContain("&start=");
  });
});
