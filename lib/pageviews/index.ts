import { ensureFile } from "$std/fs/ensure_file.ts";
import { format } from "date-fns";

await ensureFile("./pageviews.json");
await ensureFile("./pageviews_txt.json");

interface IPageViews {
  [key: string]: number;
}

const counter: IPageViews = JSON.parse((await Deno.readTextFile("./pageviews.json")) || "{}");
const counterTxt: IPageViews = JSON.parse((await Deno.readTextFile("./pageviews_txt.json")) || "{}");

export const pageviews = async function () {
  try {
    const date = format(new Date(), "yyyy-MM-dd");
    counter[date] = (counter[date] ?? 0) + 1;
    await Deno.writeTextFile("./pageviews.json", JSON.stringify(counter, null, 2));
  } catch (e) {
    console.log((e as Error).message);
  }
};

export const pageviewsTxt = async function () {
  try {
    const date = format(new Date(), "yyyy-MM-dd");
    counterTxt[date] = (counterTxt[date] ?? 0) + 1;
    await Deno.writeTextFile("./pageviews_txt.json", JSON.stringify(counterTxt, null, 2));
  } catch (e) {
    console.log((e as Error).message);
  }
};
