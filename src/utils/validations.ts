import { KiwuiHTML } from "kiwui";

// TODO: This should be relocated to dom-bindings OR dom-validator

export const isValidTag = (tag: keyof KiwuiHTML): tag is keyof KiwuiHTML => HTMLTags.includes(tag);

export const isValidText = (value: any): value is string | number => 
    typeof value === 'string' || typeof value === 'number';

//
// Contants
// ===============================================================

const HTMLTags: (keyof KiwuiHTML)[] = [
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