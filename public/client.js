import { hydrateRoot } from "https://esm.sh/react-dom@^18/client?dev";
let currentPathname = window.location.pathname;

function getInitialJSX() {
  const clientJSX = JSON.parse(window.__INITIAL_JSX__, restoreToken);
  return clientJSX;
}

const root = hydrateRoot(document, getInitialJSX());

function restoreToken(key, value) {
  if (value === "$R") {
    return Symbol.for("react.element");
  } else if (typeof value === "string" && value.startsWith("$")) {
    return value.slice(1);
  }
  return value;
}
async function fetchJSX(pathname) {
  const response = await fetch(`${pathname}?jsx`);
  const jsonString = await response.text();
  return JSON.parse(jsonString, restoreToken);
}

async function navigate(pathname) {
  currentPathname = pathname;
  const clientJSX = await fetchJSX(pathname);
  if (pathname === currentPathname) {
    root.render(clientJSX);
  }
}
window.addEventListener("click", (event) => {
  let target = event.target.tagName === "A" ? event.target : event.target.closest("a");
  if (!target) {
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return;
  }
  const href = target.getAttribute("href");
  if (!href.startsWith("/")) {
    return;
  }
  event.preventDefault();
  window.history.pushState(null, null, href);
  navigate(href);
});

window.addEventListener("popstate", (event) => {
  navigate(window.location.pathname);
});
