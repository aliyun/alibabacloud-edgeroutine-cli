'use strict';

function encode(json) {
  let temp = [
    "content-length: ",
    json.length,
    "\r\n\r\n",
    json
  ];

  return temp.join("");
}

class IncrementalDecoder {
  // state:
  //   0 --> in parsing header
  //   1 --> in parsing payload
  //   2 --> parsing message done
  constructor(onMessage) {
    this._buffer = "";
    this._state = 0;
    this._header = null;
    this._payload= null;
    this._onMessage = onMessage;
  }

  feed(data) {
    this._buffer = [this._buffer, data].join("");
    return this._tryParse();
  }

  _tryParse() {
    let cnt = 0;
    while (this._buffer.length > 0) {
      switch (this._state) {
        case 0:
          if (!this._tryHeader()) {
            return cnt;
          }
          break;
        case 1:
          if (!this._tryPayload()) {
            return cnt;
          }
          break;
      }
      if (this._state == 2) {
        const json = JSON.parse(this._payload);
        this._onMessage(this._header, json);
        this._state = 0;
        ++cnt;
      }
    }
    return cnt;
  }

  _tryHeader() {
    const end = this._buffer.indexOf("\r\n\r\n");
    if (end == -1) {
      return false;
    }
    const headerSection = this._buffer.substring(0, end);
    const headerList = headerSection.split("\r\n");
    this._header = headerList.map((x) => {
      let kv = x.split(':');
      if (kv.length != 2) {
        throw new Error("invalid header pair, no colon");
      }
      return [kv[0].trim().toLowerCase(), kv[1].trim()];
    });

    // check must have headers
    {
      let found = false;
      for (const pair of this._header) {
        if (pair[0] == "content-length") {
          this._content_length = parseInt(pair[1]);
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error("no content-length header found");
      }
    }

    this._buffer = this._buffer.substr(end+4);
    this._state = 1;
    return true;
  }

  _tryPayload() {
    if (this._buffer.length < this._content_length) {
      return false;
    }
    this._payload = this._buffer.substr(0, this._content_length);
    this._buffer = this._buffer.substr(this._content_length);
    this._state = 2;
    return true;
  }
};

module.exports = {
  encode,
  IncrementalDecoder
}
