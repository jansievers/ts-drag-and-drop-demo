// ! Don't forget to run "npx tsc" in another console.
// Otherwise the JS file will not be created!

import { ProjectInput } from "./components/project-input.js";
import { ProjectList } from "./components/project-list.js";

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');