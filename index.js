'use strict';
const fs = require('fs');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

class Divider {
	constructor(file, options) {
		let data = {
			count: 0,
			bytesCount: 0,
			restBuf: null
		};
		this.options = options || {
			separator: 0x0a
		};
		this.stream = this.getStream(file);
		let eventEmitter = this.eventEmitter = new EventEmitter();
		this.stream.on('data', function(buf) {
				let restBuf = this.data.restBuf;
				if (restBuf) {
					buf = Buffer.concat([restBuf, buf]);
				}
				this.divide(buf);
			}.bind(this))
			.on('end', function() {
				let restBuf = data.restBuf;
				if (restBuf) {
					eventEmitter.emit('divide', restBuf, data.count + 1, data.bytesCount + restBuf.length);
				}
				eventEmitter.emit('end');
			})
			.on('error', function(err) {
				eventEmitter.emit('error', err);
			})
			.on('close', function() {
				eventEmitter.emit('close');
			});

		this.data = data;
	}
	on(type, listener) {
		this.eventEmitter.on(type, listener);
	}
	once(type, listener) {
		this.eventEmitter.once(type, listener);
	}
	off(type, listener) {
		this.eventEmitter.off(type, listener);
	}
	getStream(file) {
		if (util.isString(file)) {
			return fs.createReadStream(file);
		}
		return file;
	}
	divide(buf) {
		let separators = this.options.separator;
		if (!util.isArray(separators)) {
			separators = [separators];
		}
		let data = this.data;
		let endIndex = 0;
		let eventEmitter = this.eventEmitter;
		let bytesCount = data.bytesCount;
		for (let i = 0, total = buf.length; i < total; i++) {
			let v = buf[i];
			if (separators.indexOf(v) !== -1) {
				data.count++;
				eventEmitter.emit('divide', buf.slice(endIndex, i), data.count, bytesCount + i);
				endIndex = i + 1;
			}
		}
		data.bytesCount += endIndex;
		if (endIndex !== buf.length) {
			data.restBuf = buf.slice(endIndex);
		} else {
			data.restBuf = null;
		}
	}
}



module.exports = Divider;