// Use the compiled backend so production does not need TypeScript path aliases.
import backend from "../dist/vercel.cjs";

export default backend.default;
