(function t(r,e,n){function i(s,f){if(!e[s]){if(!r[s]){var a=typeof require=="function"&&require;if(!f&&a)return a(s,!0);if(o)return o(s,!0);var u=new Error("Cannot find module '"+s+"'");throw u.code="MODULE_NOT_FOUND",u}var c=e[s]={exports:{}};r[s][0].call(c.exports,function(t){var e=r[s][1][t];return i(e?e:t)},c,c.exports,t,r,e,n)}return e[s].exports}var o=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(t,r,e){function n(t,r){this.name=t;this.value=r}n.prototype.toString=function(){return" "+this.name+'="'+this.value+'"'};if(typeof r!=="undefined"){r.exports=n}},{}],2:[function(t,r,e){var n=t("./Attr.js");function i(t,r){this.tagName=t;this.attributes=[];this.children=[];if(r){if(r instanceof i){this.addChild(r)}else{this.addChild(r.toString())}}}i.prototype.addAttr=function(t){if(!(t instanceof n)){throw new Error("Element.addAttr must be passed an instance of type: Attr")}this.attributes.push(t)};i.prototype.addChild=function(t,r){if(!(t instanceof i)&&!(t instanceof Array)&&typeof t!=="string"){throw new Error("Element.addChild must be passed an Element instance, Array or a string")}if(typeof r==="undefined"){this.children.push(t)}else if(t instanceof Array){for(var e=t.length-1;e>=0;e--){this.children.splice(r,0,t[e])}}else{this.children.splice(r,0,t)}};i.prototype.toString=function(t){var r=undefined;var e="";if(typeof t==="number"){e="  ".repeat(t);r=t+1}var n=e+"<"+this.tagName;this.attributes.forEach(function(t){n+=t.toString()});n+=">";if(this.children.length>0&&this.children[0]instanceof i){n+="\n"}this.children.forEach(function(t){n+=t.toString(r)});if(this.children.length>0&&this.children[0]instanceof i){n+=e}n+="</"+this.tagName+">";if(e){n+="\n"}return n};if(typeof r!=="undefined"){r.exports=i}},{"./Attr.js":1}],3:[function(t,r,e){String.prototype.repeat=function(t){if(t<1)return"";var r="";while(t>0){r+=this;t--}return r}},{}],4:[function(t,r,e){var n=t("./j2mTransformer.js"),i=t("./markupPrinter.js");if(typeof window==="undefined"){window={}}var o=window.j2m={execute:function(t){var r=n.transform(t);var e="";r.children.forEach(function(t){e+=i.prettyPrint(t)});return e}};if(typeof r!=="undefined"){r.exports=o}},{"./j2mTransformer.js":5,"./markupPrinter.js":6}],5:[function(t,r,e){t("./String-Extensions.js");var n=t("./Attr.js"),i=t("./Element.js");var o={transform:function(t,r){if(!r){r=new i("__ROOT__")}if(typeof t==="string"){try{t=JSON.parse(t)}catch(e){var n=o.getStringAsMarkup(t);r.addChild(n);return r}}else if(typeof t==="number"||t instanceof Date||typeof t==="boolean"){var n=o.getStringAsMarkup(t.toString());r.addChild(n);return r}o.transformObjectToMarkup(t,r);return r},getStringAsMarkup:function(t){return t},transformObjectToMarkup:function(t,r){if(t instanceof Array){t.forEach(function(t){o.transform(t,r)})}for(var e in t){var n=t[e];if(e.indexOf(".")>-1){}else if(e[0]==="@"){var i=o.processAttr(e,n);r.addAttr(i)}else if(e==="$str"){r.addChild(n)}else if(e[0]==="$"){var s=o.processNumberedElement(e,n);r.addChild(s.ele,s.index)}else{var f=o.processElement(e,n);r.addChild(f)}}},processAttr:function(t,r){return new n(t.substr(1),r.toString())},processElementWithPlainTextValue:function(t,r){return new i(t,r)},processNumberedElement:function(t,r){var e="";var n=-1;for(var i=1;i<t.length;i++){if(isNaN(t[i])){e=t.substr(i);n=parseInt(t.substr(1,i-1));break}}if(e===""){throw new Error("Cannot resolve $ in property name: "+t)}return{index:n,ele:this.processElement(e,r)}},processElement:function(t,r){if(r instanceof Array){var e=[];r.forEach(function(r){var n=new i(t);o.transform(r,n);e.push(n)});return e}else if(typeof r==="object"){var n=new i(t);o.transform(r,n);return n}else{return o.processElementWithPlainTextValue(t,r)}}};if(typeof r!=="undefined"){r.exports=o}},{"./Attr.js":1,"./Element.js":2,"./String-Extensions.js":3}],6:[function(t,r,e){var n={print:function(t){return t.toString()},prettyPrint:function(t){return t.toString(0)}};if(typeof r!=="undefined"){r.exports=n}},{}]},{},[4]);if(typeof module!=="undefined"){module.exports=window.j2m}