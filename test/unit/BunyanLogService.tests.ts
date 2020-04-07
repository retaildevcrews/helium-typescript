import "reflect-metadata";
import { BunyanLogService } from "../../src/services";
import * as bunyan from "bunyan";
import * as chai from  "chai";
import * as sinon from "sinon";
import * as sinonChai  from "sinon-chai";

chai.should();
chai.use(sinonChai);

describe("BunyanLogService", () => {
  const spy = sinon.spy(bunyan, "createLogger");
  const log = new BunyanLogService;

  describe("trace", () => {
    it("Bunyan is initiated", () => {
      log.trace("Can you hear me now?");
      spy.should.have.been.calledOnce;
    });
  });

  describe("warn", () => {
    it("Bunyan is initiated", () => {
      log.warn("Can you hear me now?");
      spy.should.have.been.calledOnce;
    });
  });

  describe("error", () => {
    it("Bunyan is initiated", () => {
      log.error(Error("new error"), "new Error");
      spy.should.have.been.calledOnce;
    });
  });
});
