import "reflect-metadata";
import { BunyanLogService } from "../../src/services";
import * as bunyan from "bunyan";
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.should();
chai.use(sinonChai);

describe("BunyanLogService", () => {
  const spy = sinon.spy(bunyan, 'createLogger');
  const log = new BunyanLogService;

  describe("trace", () => {
    it("Bunyan is initiated", () => {
      
      log.trace("Can you hear me now?");
      console.log(process.stdout.write)
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