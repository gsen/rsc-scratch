import { register } from "node:module";

register("./node-jsx-loader.js", import.meta.url);

import babel from "@babel/core";

import { babelOptions } from "./public/common.js";

export async function load(url, context, defaultLoad) {
  const result = await defaultLoad(url, context, defaultLoad);

  if (result.format === "module") {
    const opt = Object.assign({ filename: url }, babelOptions);
    const newResult = await babel.transformAsync(result.source, opt);
    if (newResult.code.includes("use client")) {
      const func = "function";
      const functionStart = "(";
      const startIndex = newResult.code.indexOf(func) + func.length;
      const endIndex = newResult.code.indexOf(functionStart);
      newResult.code += `\n${newResult.code.substring(startIndex, endIndex).trim()}.__clientComponent__=".${
        newResult.options.filename.split("public")[1]
      }";`;
      console.log(newResult.code);
    }
    if (!newResult) {
      if (typeof result.source === "string") {
        return result;
      }
      return {
        source: Buffer.from(result.source).toString("utf8"),
        format: "module",
      };
    }
    return { source: newResult.code, format: "module" };
  }
  return defaultLoad(url, context, defaultLoad);
}
