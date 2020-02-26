const assert = require("assert");

const P = require("../src/debugger/lib/protocol.js");

describe("ProtocolEncoder", () => {
  it("encoding", () => {
    const d = P.encode("{}");
    const p = new P.IncrementalDecoder((hdr, msg) => {
      assert(hdr[0][0] == "content-length");
      assert(hdr[0][1] == "2");
      assert(JSON.stringify(msg) == "{}");
    });
    assert(p.feed(d) == 1);
  });
});

describe("ProtocolDecoder", () => {
  describe("#basicMessage", () => {
    it("parse basic message", () => {
      const d = new P.IncrementalDecoder((hdr, msg) => {
        assert(hdr[0][0] === "content-length");
        assert(msg.name == "test1");
        assert(msg.data == "Hello World");
      });

      assert(d.feed(P.encode(`{
        "name": "test1",
        "data": "Hello World"
      }`)) == 1);

      assert.throws(
        () => {
          d.feed(P.encode("{"));
        }
      );
    });
  });

  describe("#incremental", () => {
    it("incremental parsing, feeding data one byte by one byte", () => {
      const d = new P.IncrementalDecoder((hdr, msg) => {
        assert(hdr[0][0] === "content-length");
        assert(msg.name == "test1");
        assert(msg.data == "Hello World");
      });

      const data = P.encode(`{
        "name": "test1",
        "data": "Hello World"
      }`);

      for (let i = 0; i < data.length-1; ++i) {
        assert(d.feed(data.charAt(i)) == 0);
      }
      assert(d.feed(data.charAt(data.length-1)) == 1);
    });
  });
});
