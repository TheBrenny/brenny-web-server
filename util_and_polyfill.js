const util = require('util');

// ARRAYS

Array.prototype.hasCombination = function (a2) {
    return this.length === a2.length && this.every(val => a2.includes(val)) && a2.every(val => this.includes(val));
};

Array.prototype.containsNull = function (count) {
    count = count || 1;
    if (count === 0) return this.length === 0;
    return this.filter(e => e === undefined || e === null).length >= count;
};

// REGEXPS

RegExp.escape = function (s) {
    return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};

// STRINGS

String.prototype.replaceAll = function (find, replace) {
    if (find.constructor.name === "String") {
        find = new RegExp(RegExp.escape(find), "g");
    }
    if (find.constructor.name !== "RegExp") return this;
    if (!find.global) find = new RegExp(find, find.flags + "g");
    return this.replace(find, replace);
};

// Matchall polyfill - this is how we handle Node <12
if (!String.prototype.matchAll) {
    String.prototype.matchAll = function (rx) {
        if (typeof rx === "string") rx = new RegExp(rx, "g");
        rx = new RegExp(rx);
        let cap = [];
        let all = [];
        while ((cap = rx.exec(this)) !== null) all.push(cap);
        return all;
    };
}

let ogSubstr = String.prototype.substr;
String.prototype.substr = function (start, length) {
    if (start < 0) start = (start % this.length) + this.length;
    if (length < 0) {
        length = Math.abs(length);
        start -= length;
    }
    return ogSubstr.call(this, start, length);
};

let ogSubstring = String.prototype.substring;
String.prototype.substring = function (start, end) {
    if (start < 0) start = (start % this.length) + this.length;
    if (end < 0) end = (end % this.length) + this.length;
    return ogSubstring.call(this, start, end);
};

// OBJECTS

Object.prototype.doesExtend = function (theSuper) {
    return util.inherits(this.constructor || this, theSuper.constructor || theSuper);
};