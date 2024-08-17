import express from "express";
import escapeHTML from "escape-html";
import { readdir, readFile } from "node:fs/promises";
const app = express();
const port = 3000;

async function convertJSXToHTML(jsx) {
  if (typeof jsx === "string" || typeof jsx === "number") {
    return escapeHTML(jsx);
  } else if (jsx == null || typeof jsx === "boolean") {
    return "";
  } else if (Array.isArray(jsx)) {
    let childHTML = await Promise.all(jsx.map(convertJSXToHTML));
    return childHTML.join("");
  } else if (typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (typeof jsx.type === "string") {
        let html = `<${jsx.type}`;
        for (let propName in jsx.props) {
          if (jsx.props.hasOwnProperty(propName) && propName !== "children") {
            html += ` ${propName}="${escapeHTML(jsx.props[propName])}"`;
          }
        }

        html += `>`;
        html += await convertJSXToHTML(jsx.props.children);
        html += `</${jsx.type}>`;
        return html.replaceAll("className", "class");
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type;
        const props = jsx.props;
        const componentJSX = await Component(props);
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

function Layout({ children }) {
  const person = { firstName: "Gaurav", lastName: "Sen" };

  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hello World</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <header className="main-header">
          <nav>
            <a href="/">Home</a>
            <hr />
            <input type="text" />
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer>
          <Author {...person} />
        </footer>
      </body>
    </html>
  );
}

async function RecipeCard({ slug }) {
  const { name, image } = JSON.parse(await readFile(`./recipes/${slug}.json`, "utf-8"));

  return (
    <a className="recipe-card" href={`/${slug}`}>
      <article className="content">
        <img className="recipe-image" src={image} alt={`name of the recipe ${name}`} />
        <h1 className="recipe-title">{name}</h1>
      </article>
    </a>
  );
}

async function Home() {
  const recipeFiles = await readdir("./recipes");
  const recipeSlugs = recipeFiles.map((file) => file.replace(".json", ""));

  return (
    <article>
      <h1>My Recipes</h1>
      <section>
        <ul className="recipe-list">
          {recipeSlugs.map((slug) => (
            <li key={slug}>
              <RecipeCard key={slug} slug={slug} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

async function Recipe({ slug }) {
  const { name, instructions, ingredients, image, rating } = JSON.parse(
    await readFile(`./recipes/${slug}.json`, "utf-8")
  );

  return (
    <article className="recipe">
      <header>
        <h1 className="recipe-title">{name}</h1>
        <h3>Rating {rating}⭐️</h3>
      </header>
      <img src={image} alt={`name of the recipe ${name}`} />
      <section className="recipe-details">
        <section className="recipe-ingredients">
          <h2>Ingredients</h2>
          <ul className="recipe-ingredients">
            {ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>
        <section className="recipe-instructions">
          <h2>Instructions</h2>
          <ol className="recipe-instructions">
            {instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
        </section>
      </section>
    </article>
  );
}

function Router({ url }) {
  let page;
  if (url === "/") {
    page = <Home />;
  } else {
    page = <Recipe slug={url} />;
  }
  return <Layout>{page}</Layout>;
}

app.use(express.static("public"));

app.get("/*", async (req, res) => {
  const html = await convertJSXToHTML(<Router url={req.url} />);
  res.send(html);
});

app.listen(port, () => {
  console.log(`RSC app listening at http://localhost:${port}`);
});
