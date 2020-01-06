/**
 * Created by nbeni on 1/6/2020.
 */

describe("[Dictionary Object]", () => {
    it("creation w/mock connector", (done) => {
        requirejs(["PicSure/Adapters/HPDS/PicSureHpdsDictionary"], function(HpdsDictionary) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let res_conn = {
                "resource_uuid": "0000-0000-0000-0000",
                "connection_reference": {
                    "url": test_url,
                    "token": test_token,
                    "_api_obj": function() { return {} }
                }
            }
            let dictionary = new HpdsDictionary(res_conn);
            expect(typeof dictionary).not.toBe(undefined);
            expect(typeof dictionary).toBe('object');
            expect(dictionary.constructor.name).toBe("PicSureHpdsDictionary");
            expect(dictionary._refResourceConnection.connection_reference.url).toBe(test_url);
            expect(dictionary._refResourceConnection.connection_reference.token).toBe(test_token);
            done();
        });
    });
    it("search()", (done) => {
        requirejs(["PicSure/Adapters/HPDS/PicSureHpdsDictionary"], function(HpdsDictionary) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let test_uuid = "0000-0000-0000-0000";
            let test_term = "asthma";
            let res_conn = {
                "resource_uuid": test_uuid,
                "connection_reference": {
                    "url": test_url,
                    "token": test_token,
                    "_api_obj": function() {
                        let retAPI = {}
                        retAPI.search = function(uuid, query) {
                            return (new Promise((resolve, reject) => {
                                expect(uuid).toBe(test_uuid);
                                expect(query).toBe('{"query":"'+test_term+'"}');
                            }));
                        };
                        return retAPI;
                    }
                }
            }
            let dictionary = new HpdsDictionary(res_conn);
            expect(typeof dictionary).not.toBe(undefined);
            expect(typeof dictionary).toBe('object');
            expect(dictionary.constructor.name).toBe("PicSureHpdsDictionary");

            dictionary.find(test_term);

            done();
        });
    });
});

