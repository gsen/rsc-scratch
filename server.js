import express from "express";
import escapeHTML from "escape-html";
const app = express();
const port = 3000;

function convertJSXToHTML(jsx) {
  if (typeof jsx === "string" || typeof jsx === "number") {
    return escapeHTML(jsx);
  } else if (jsx == null || typeof jsx === "boolean") {
    return "";
  } else if (Array.isArray(jsx)) {
    return jsx.map(convertJSXToHTML).join("");
  } else if (typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (typeof jsx.type === "string") {
        let html = `<${jsx.type}`;
        for (let propName in jsx.props) {
          if (jsx.hasOwnProperty(propName) && propName !== "children") {
            html += ` ${propName}="${escapeHTML(jsx.props[propName])}"`;
          }
        }

        html += `>`;
        html += convertJSXToHTML(jsx.props.children);
        html += `</${jsx.type}>`;
        return html;
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type;
        const props = jsx.props;
        const componentJSX = Component(props);
        return convertJSXToHTML(componentJSX);
      }
    } else throw new Error("Cannot render an object");
  } else throw new Error("Not implemented yet");
}

function Author({ firstName, lastName }) {
  return (
    <p>
      Writen by {firstName} {lastName}
    </p>
  );
}

app.get("/", (req, res) => {
  const person = { firstName: "Gaurav", lastName: "Sen" };
  const jsx = (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hello World</title>
      </head>
      <body>
        <h1>Hello, World!</h1>
        <footer>
          <Author {...person} />
        </footer>
      </body>
    </html>
  );
  console.log(jsx);
  const html = convertJSXToHTML(jsx);
  res.send(html);
});

app.listen(port, () => {
  console.log(`RSC app listening at http://localhost:${port}`);
});
