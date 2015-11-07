'use strict';
const Divider = require('..');
const path = require('path');
console.dir(path.join(__dirname, '../files/test'));
let tmp = new Divider(path.join(__dirname, '../files/test'), {
	separator: 'e'.charCodeAt(0)
});
tmp.on('divide', function(buf, count, bytesCount) {
	console.dir(count);
	console.dir(bytesCount);
});