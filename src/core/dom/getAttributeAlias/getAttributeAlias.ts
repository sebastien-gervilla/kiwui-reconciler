export const getAttributeAlias = (attribute: string) => {
    return aliases[attribute] || attribute;
}

const aliases: {[key: string]: string} = {
    // TODO:
    'acceptCharset': 'accept-charset',
    'htmlFor': 'for',
    'httpEquiv': 'http-equiv',

    // HTML and SVG attributes: but the SVG attribute is case sensitive.,
    'crossOrigin': 'crossorigin',

    // This is a list of all SVG attributes that need special casing.
    // Regular attributes that just accept strings.,
    'accentHeight': 'accent-height',
    'alignmentBaseline': 'alignment-baseline',
    'arabicForm': 'arabic-form',
    'baselineShift': 'baseline-shift',
    'capHeight': 'cap-height',
    'clipPath': 'clip-path',
    'clipRule': 'clip-rule',
    'colorInterpolation': 'color-interpolation',
    'colorInterpolationFilters': 'color-interpolation-filters',
    'colorProfile': 'color-profile',
    'colorRendering': 'color-rendering',
    'dominantBaseline': 'dominant-baseline',
    'enableBackground': 'enable-background',
    'fillOpacity': 'fill-opacity',
    'fillRule': 'fill-rule',
    'floodColor': 'flood-color',
    'floodOpacity': 'flood-opacity',
    'fontFamily': 'font-family',
    'fontSize': 'font-size',
    'fontSizeAdjust': 'font-size-adjust',
    'fontStretch': 'font-stretch',
    'fontStyle': 'font-style',
    'fontVariant': 'font-variant',
    'fontWeight': 'font-weight',
    'glyphName': 'glyph-name',
    'glyphOrientationHorizontal': 'glyph-orientation-horizontal',
    'glyphOrientationVertical': 'glyph-orientation-vertical',
    'horizAdvX': 'horiz-adv-x',
    'horizOriginX': 'horiz-origin-x',
    'imageRendering': 'image-rendering',
    'letterSpacing': 'letter-spacing',
    'lightingColor': 'lighting-color',
    'markerEnd': 'marker-end',
    'markerMid': 'marker-mid',
    'markerStart': 'marker-start',
    'overlinePosition': 'overline-position',
    'overlineThickness': 'overline-thickness',
    'paintOrder': 'paint-order',
    'panose-1': 'panose-1',
    'pointerEvents': 'pointer-events',
    'renderingIntent': 'rendering-intent',
    'shapeRendering': 'shape-rendering',
    'stopColor': 'stop-color',
    'stopOpacity': 'stop-opacity',
    'strikethroughPosition': 'strikethrough-position',
    'strikethroughThickness': 'strikethrough-thickness',
    'strokeDasharray': 'stroke-dasharray',
    'strokeDashoffset': 'stroke-dashoffset',
    'strokeLinecap': 'stroke-linecap',
    'strokeLinejoin': 'stroke-linejoin',
    'strokeMiterlimit': 'stroke-miterlimit',
    'strokeOpacity': 'stroke-opacity',
    'strokeWidth': 'stroke-width',
    'textAnchor': 'text-anchor',
    'textDecoration': 'text-decoration',
    'textRendering': 'text-rendering',
    'transformOrigin': 'transform-origin',
    'underlinePosition': 'underline-position',
    'underlineThickness': 'underline-thickness',
    'unicodeBidi': 'unicode-bidi',
    'unicodeRange': 'unicode-range',
    'unitsPerEm': 'units-per-em',
    'vAlphabetic': 'v-alphabetic',
    'vHanging': 'v-hanging',
    'vIdeographic': 'v-ideographic',
    'vMathematical': 'v-mathematical',
    'vectorEffect': 'vector-effect',
    'vertAdvY': 'vert-adv-y',
    'vertOriginX': 'vert-origin-x',
    'vertOriginY': 'vert-origin-y',
    'wordSpacing': 'word-spacing',
    'writingMode': 'writing-mode',
    'xmlnsXlink': 'xmlns:xlink',
    'xHeight': 'x-height',
};