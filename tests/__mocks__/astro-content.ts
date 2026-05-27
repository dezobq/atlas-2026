/**
 * Mock de astro:content para uso em Vitest.
 * O módulo virtual astro:content não é resolvível no runtime do Vitest sem
 * o Astro Vite plugin. Este arquivo é mapeado via resolve.alias em vitest.config.ts.
 *
 * Exporta vi.fn() para getCollection e getEntry, permitindo que cada test
 * configure o comportamento via vi.mocked(...).mockResolvedValue(...).
 */
import { vi } from "vitest";

export const getCollection = vi.fn();
export const getEntry = vi.fn();
export const getEntries = vi.fn();
export const reference = vi.fn();
export const defineCollection = vi.fn();
export const z = {};
