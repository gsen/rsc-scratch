export const babelOptions = {
  babelrc: false,
  ignore: [/\/(build|node_modules)\//],
  plugins: [["@babel/plugin-transform-react-jsx", { runtime: "automatic" }]],
};
export async function rebuildJSXWithClientComponents(jsx) {
  if (typeof jsx === "string" || typeof jsx === "number") {
    return jsx;
  } else if (Array.isArray(jsx)) {
    return Promise.all(jsx.map(rebuildJSXWithClientComponents));
  } else if (typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (typeof jsx.type === "string") {
        return {
          ...jsx,
          props: await rebuildJSXWithClientComponents(jsx.props),
        };
      } else if (typeof jsx.type === "object" && jsx.type.file) {
        return {
          ...jsx,
          type: (await import(`${jsx.type.file}?rcc`)).default,
          props: await rebuildJSXWithClientComponents(jsx.props),
        };
      } else {
        throw new Error("Not Implemented yet");
      }
    } else {
      const result = Object.fromEntries(
        await Promise.all(
          Object.entries(jsx).map(async ([propName, value]) => [propName, await rebuildJSXWithClientComponents(value)])
        )
      );
      return result;
    }
  }
}
