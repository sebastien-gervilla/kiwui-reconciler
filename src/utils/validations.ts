import { SageHTML } from "sage";

// !!!!!!!!!!!!!!!!!!!!!
// TODO: This should be relocated to dom-bindings

export const isValidTag = (tag: string): tag is keyof SageHTML => tag in HTMLTags;

//
// Contants
// ===============================================================

const HTMLTags: (keyof SageHTML)[] = [
    "a",
    "article", 
    "b",
    "body",
    "button",
    "code", 
    "div",
    "em", 
    "footer", 
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header", 
    "html",
    "img",
    "input",
    "label",
    "li",
    "link",
    "main", 
    "meta",
    "nav", 
    "ol",
    "option",
    "p", 
    "pre",
    "script",
    "section", 
    "select",
    "span",
    "strong", 
    "style",
    "table", 
    "td",
    "textarea",
    "th",
    "title", 
    "ul", 
    "video",
]