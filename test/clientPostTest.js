const assert = require("assert");
const proxyquire = require("proxyquire").noCallThru();
const loggerStub = require("./stubs/loggerStub");

const mysqlStub = {};

const clients = proxyquire("./../src/clients", {
    "namshi-node-mysql": _ => mysqlStub,
    "./logger": loggerStub
});

describe("clients", () => {
    describe("create", () => {
          it("should create client when provided client create data is valid and db response is ok", async () => {
             try {
                  mysqlStub.query = (query, params) => {
                    if (query.startsWith(`INSERT INTO clientDetails`)) {
                      assert.strictEqual(params.length, 6);
                      return { affectedRows: 1, insertId: 7 };
                    }
                };
                  const result = await clients.create({
                    fullName:"Alice Limbu",
                    gender:"Male",
                    age:28,
                    address:"Kogarah",
                    phone: "0123456789",
                    email: "alis@gmail.com",
                  });
                  assert.strictEqual(
                    result.message,
                    "client Alice Limbu with id 7 created successfully"
                  );
                } catch (err) {
                  assert.strictEqual(err.message, "should never reach here");
                }
          });
          it("should not create client when provided client create data is valid and db response is not ok", async () => {
                       try {
                            mysqlStub.query = (query, params) => {
                              if (query.startsWith(`INSERT INTO clientDetails`)) {
                                assert.strictEqual(params.length, 6, "should get 6 params");
                                throw new Error("DB host is offline");
                              }
                          };
                              await clients.create({
                              fullName:"Alice Limbu",
                              gender:"Male",
                              age:28,
                              address:"Kogarah",
                              phone: "0123456789",
                              email: "alis@gmail.com",
                            });
                       } catch (err) {
                            assert.strictEqual(err.statusCode, 500);
                            assert.strictEqual(err.message, "Error while creating client")
                          }
                    });
       it("should return error when the provided data has required key missing", async () => {
           try{
            await clients.create({age:10 });
           throw new Error("should never reach here")
           }catch (err){
           assert.strictEqual(err.message, "Error: (Full name is required)")
          }
       });
       it("should return error when the provided data has wrong values", async () => {
                  try{
                   await clients.create({full_name:1});
                  throw new Error("should never reach here")
                  }catch (err){
                  assert.strictEqual(err.message, "Error: (Full name is required)")
                 }
              });
    }); //create close
});
