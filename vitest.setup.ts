process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
// Asegura que la variable de entorno esté definida para todos los tests
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
// vitest.setup.ts
import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// extiende expect con los matchers de jest-dom
expect.extend(matchers);
