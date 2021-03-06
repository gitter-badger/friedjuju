require('./String-Extensions.js');
var Attr = require('./Attr.js'),
	Element = require('./Element.js'),
	objectGraphCreator = require('./objectGraphCreator'),
	domElementConverter = require('../vdom/domElementConverter.js'),
	strippedDownMarkupParser = require('../vdom/strippedDownMarkupParser.js');


/* *******************
 * j2mTransformer: Used to perform the JSON to markup transformations.
 * This is the actual worker that is invoked by the j2m.js module.
 */
var j2mTransformer = {
	// Transforms an object into markup
	// obj: The object to transform into markup
	// targetEle: [OPTIONAL] The target element to render into
	//				targetEle is modified by this method.
	// Returns: The target element into which the content has been created
	// External Calling Syntax: j2mTransformer.transform(obj)
	// Internal Recursive Calling Syntax: j2mTransformer.transform(obj, targetEle)
	transform: function (obj, targetEle) {
		if (!targetEle) {
			targetEle = new Element('__ROOT__');
		}

		if (typeof obj === 'string') {
			try {
				// if the string is JSON then parse it
				obj = JSON.parse(obj);
			} catch (e) {
				// since the string is not JSON then transform it as a string
				var ret = j2mTransformer.getStringAsMarkup(obj);
				targetEle.addChild(ret);
				return targetEle;
			}
		} else if (typeof obj === 'number' || obj instanceof Date || typeof obj === 'boolean') {
			var ret = j2mTransformer.getStringAsMarkup(obj.toString());
			targetEle.addChild(ret);
			return targetEle;
		}

		j2mTransformer.transformObjectToMarkup(obj, targetEle);
		return targetEle;
	},

	// Normalizes a DOM element into an Element instance and wraps it in a __ROOT__ element
	// domElement: The DOM element
	// Returns: The Element instance
	envelopeDOMElement: function (domElement) {
		var rootEle = new Element('__ROOT__');
		if (domElement.innerHTML) {
			var theEle = strippedDownMarkupParser.parse('<nop>' + domElementConverter.convertDOMElementChildrenToXml(domElement) + '</nop>');

			theEle.children.forEach(function (child) {
				rootEle.addChild(child);
			});
		}
		return rootEle;
	},

	// Performs an identity transformation into markup, i.e. it simply returns the string
	getStringAsMarkup: function (str) {
		return str;
	},

	transformObjectToMarkup: function (obj, targetEle) {
		if (obj instanceof Array) {
			// loop to transform the array elements
			obj.forEach(function (item) {
				j2mTransformer.transform(item, targetEle);
			});
		}

		// expand the dot expressions so that we are processing a hierarchical set of objects
		// instead of the dot notated ones
		var newObj = objectGraphCreator.expand(obj);

		for (var key in newObj) {
			var val = newObj[key];
			if (key.indexOf('.') > -1) {
				// a dotted expression
				// e.g. 'table.$1tr.td.@colspan': 2,
				// We should never find a key which is a dot expression since they should all have been
				// expanded into a hierarchy in the newObj = objectGraphCreator.expand(obj) statement above.
				throw new Error('Found a dotted expression that was not expanded: ' + key);
			} else if (key[0] === '@') {
				// newObj is an attribute declaration
				// e.g. @colspan': 2
				var attr = j2mTransformer.processAttr(key, val);
				targetEle.addAttr(attr);
			} else if (key === '$str') {
				// val is plain text
				// e.g. '$str': '?age years old'
				targetEle.addChild(val);
			} else if (key[0] === '$') {
				// this is a $number
				// e.g. $2tr
				var numberedElementInfo = j2mTransformer.processNumberedElement(key, val);
				targetEle.addChild(numberedElementInfo.ele, numberedElementInfo.index);
			} else {
				var ele = j2mTransformer.processElement(key, val);
				targetEle.addChild(ele);
			}
		}
	},

	processAttr: function (key, val) {
		return new Attr(key.substr(1), val.toString());
	},

	processElementWithPlainTextValue: function (key, val) {
		return new Element(key, val);
	},

	// Processes a numbered element
	processNumberedElement: function (key, val) {
		var tagName = '';
		var index = -1;
		for (var d = 1; d < key.length; d++) {
			if (isNaN(key[d])) {
				tagName = key.substr(d);
				index = parseInt(key.substr(1, d - 1));
				break;
			}
		}

		if (tagName === '') {
			throw new Error('Cannot resolve $ in property name: ' + key);
		}

		return {
			index: index,
			ele: this.processElement(tagName, val)
		};
	},

	// Processes an element
	// key: The tagName of the element to be created
	// val: The definition of the element to be created
	// Returns: An array if val is an array
	// 			An element if val is an object
	//			An element with a single child and no attributes if val is a non-object
	processElement: function (key, val) {
		if (val instanceof Array) {
			// key is the element which is to be replicated across the val elements
			var arr = [];
			val.forEach(function (item) {
				var ele = new Element(key);

				j2mTransformer.transform(item, ele);
				// for (var childkey in item) {
				// 	var child = val[childkey];
				// 	j2mTransformer.transform(child, ele);
				// }

				arr.push(ele);
			});
			return arr;
		} else if (typeof val === 'object') {
			// key is the element whose contents are found within val
			// key = new tagName
			// value = attrs + children
			var ele = new Element(key);
			j2mTransformer.transform(val, ele);
			// for (var childkey in val) {
			// 	var child = val[childkey];
			// 	j2mTransformer.transform(child, ele);
			// }
			return ele;
		} else {
			// key is the element whose plain text value is val.toString()
			return j2mTransformer.processElementWithPlainTextValue(key, val);
		}
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2mTransformer;
}
