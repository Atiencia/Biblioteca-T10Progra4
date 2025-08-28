// vitest.setup.ts
import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// extiende expect con los matchers de jest-dom
expect.extend(matchers);
