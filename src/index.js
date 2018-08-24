/* @flow */

/* eslint-disable no-restricted-syntax, guard-for-in */

const __noop__ = '!noop-important'
const postfix = '!important';

export function noop(value) {
    return [].concat(value, __noop__);
}

export function isNoop(value) {
    return value.length && (value[value.length - 1] === __noop__)
}

/**
 * Recursive deep style passing function
 *
 * @param {String} current property
 * @param {(Object|Array|Number|String)} property value
 * @param {Object} options
 * @return {(Object|Array|Number|String)} resulting value
 */
function iterate(prop, baseValue, options) {
    if (!baseValue) return baseValue;

    let value = baseValue;

    let type = typeof value;
    if (type === 'object' && Array.isArray(value)) type = 'array';

    /**
     * Check if this value is noop
     */
    if (type === 'array' && isNoop(value)) {
        value.splice(-1)

        return value
    }

    switch (type) {
        case 'object':
            if (prop === 'fallbacks') {
                for (const innerProp in value) {
                    value[innerProp] = iterate(innerProp, value[innerProp], options);
                }
                break;
            }
            for (const innerProp in value) {
                value[innerProp] = iterate(`${prop}-${innerProp}`, value[innerProp], options);
            }
            break;
        case 'array':
            if (value[value.length - 1] !== postfix) {
                value.push(postfix);
            }
            break;
        default:
            if (type === 'number' || value.slice(-postfix.length) !== postfix) {
                value = value + ' ' + postfix
            }

            break;
    }

    return value;
}

export default function important(options = {}) {
    function onProcessStyle(style, rule) {
        if (rule.type !== 'style') return style;

        for (const prop in style) {
            style[prop] = iterate(prop, style[prop], options);
        }

        return style;
    }

    function onChangeValue(value, prop) {
        return iterate(prop, value, options);
    }

    return {onProcessStyle, onChangeValue};
}
