import { describe, it, expect } from "vitest";
import {
  DATA_DIR,
  CACHE_DIR,
  PUBLIC_DIR,
  OG_DIR,
  DATASET_DIR,
} from "../../../../scripts/lib/paths";
import { resolve } from "node:path";

describe("paths", () => {
  it("DATA_DIR aponta para <cwd>/data", () => {
    expect(DATA_DIR).toBe(resolve(process.cwd(), "data"));
  });

  it("CACHE_DIR aponta para <cwd>/.cache", () => {
    expect(CACHE_DIR).toBe(resolve(process.cwd(), ".cache"));
  });

  it("PUBLIC_DIR aponta para <cwd>/public", () => {
    expect(PUBLIC_DIR).toBe(resolve(process.cwd(), "public"));
  });

  it("OG_DIR fica dentro de PUBLIC_DIR", () => {
    expect(OG_DIR).toBe(resolve(process.cwd(), "public", "og"));
  });

  it("DATASET_DIR aponta para <cwd>/dist-dataset", () => {
    expect(DATASET_DIR).toBe(resolve(process.cwd(), "dist-dataset"));
  });
});
