import "reflect-metadata";
import { BunyanLogService } from "../../src/services";
import { LogService } from "../../src/services";
import * as bunyan from "bunyan";
import * as chai from  "chai";
import * as sinon from "sinon";
import * as sinonChai  from "sinon-chai";

chai.should();
chai.use(sinonChai);

describe("BunyanLogService", () => {
  const spy = sinon.spy(bunyan, "createLogger");
  const log = new BunyanLogService;
  
  before(() => {
    sinon.stub(log, 'trace')  // disable console.log
    sinon.stub(log, 'info')  // disable console.info
    sinon.stub(log, 'warn')  // disable console.warn
    sinon.stub(log, 'error')  // disable console.error
  })

  describe("trace", () => {
    it("should initiate Buyan for trace", () => {
      log.trace("Can you hear me now?");
      spy.should.have.been.calledOnce;
    });
  });

  describe("info", () => {
    it("should initiate Buyan for info", () => {
      log.info("Can you hear me now?");
      spy.should.have.been.calledOnce;
    });
  });

  describe("warn", () => {
    it("should initiate Buyan for warn", () => {
      log.warn("Can you hear me now?");
      spy.should.have.been.calledOnce;
    });
  });

  describe("error", () => {
    it("should initiate Buyan for error", () => {
      log.error(Error("new error"), "new Error");
      spy.should.have.been.calledOnce;
    });
  });
});
