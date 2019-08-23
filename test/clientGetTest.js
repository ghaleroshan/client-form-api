const assert = require("assert");
const proxyquire = require("proxyquire").noCallThru();
const loggerStub = require("./stubs/loggerStub");

const mysqlStub = {};

const clients = proxyquire("./../src/clients", {
    "namshi-node-mysql": _ => mysqlStub,
    "./logger": loggerStub
});

describe("clients", () => {
    describe("getMultiple", () => {
          it("should return clients from the db when clients exists", async () => {
            try {
                mysqlStub.query = (query, params) => {
                    if (query.startsWith(`SELECT id, fullName`)) {
                        return [
                            {
                                id: 1,
                                fullName:"Alice Limbu",
                                gender:1,
                                age:28,
                                address:"Kogarah",
                                phone: "0123456789",
                                email: "alis@gmail.com",
                            }
                        ];
                    }
                };

                const result = await clients.getMultiple({});
                assert.deepStrictEqual(result[0], {
                    id: 1,
                    fullName:"Alice Limbu",
                    gender:1,
                    age:28,
                    address:"Kogarah",
                    phone: "0123456789",
                    email: "alis@gmail.com",
                });
            } catch (err) {
                console.log(`err`, err);
                assert.deepStrictEqual(err.message, "should never reach here");
            }
        });
        it("should return no clients from the db when no clients exists", async () => {
            try {
                mysqlStub.query = (query, params) => {
                    if (query.startsWith(`SELECT id, fullName`)) {
                        return [];
                    }
                };

                const result = await clients.getMultiple({});
                assert.deepStrictEqual(result, []);
            } catch (err) {
                console.log(`err`, err);
                assert.strictEqual(err.message, "should never reach here");
            }
        });
    });
});
