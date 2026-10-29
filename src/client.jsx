import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

// The served HTML is already fully rendered (scripts/build.mjs). This attaches behaviour to it.
hydrateRoot(document.getElementById("root"), <App />);
