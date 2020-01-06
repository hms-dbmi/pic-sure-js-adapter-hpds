/**
 * Created by nbeni on 12/19/2019.
 */


describe("[Adapter Object operations]", () => {
    it("version()", (done) => {
        requirejs(["PicSure/Connector/Connector", "PicSure/Adapters/HPDS/Adapter"], function(PicSureClient, HpdsAdapter) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let conn = PicSureClient.connect(test_url, test_token);
            let adapter = HpdsAdapter.Adapter(conn);
            expect(typeof adapter).not.toBe(undefined);
            expect(typeof adapter).toBe('object');
            expect(adapter.constructor.name).toBe("PicSureHpdsAdapter");
            spyOn(console, "log")
            adapter.version();
            expect(console.log).toHaveBeenCalled();
            done();
        });
    });
    it("useResource()", (done) => {
        requirejs(["PicSure/Connector/Connector", "PicSure/Adapters/HPDS/Adapter"], function(PicSureClient, HpdsAdapter) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let test_uuid = "0000-0000-0000-0000";
            let conn = PicSureClient.connect(test_url, test_token);
            let adapter = HpdsAdapter.Adapter(conn);
            let resource = adapter.useResource(test_uuid);
            expect(typeof resource).not.toBe(undefined);
            expect(typeof resource).toBe('object');
            expect(resource.constructor.name).toBe("PicSureHpdsResourceConnection");
            done();
        });
    });
});


describe("[Resource Connection operations]", () => {
    it("Create Resource Connection", (done) => {
        requirejs(["PicSure/Connector/Connector", "PicSure/Adapters/HPDS/Adapter"], function(PicSureClient, HpdsAdapter) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let test_uuid = "0000-0000-0000-0000";
            let conn = PicSureClient.connect(test_url, test_token);
            let adapter = HpdsAdapter.Adapter(conn);
            let resource = adapter.useResource(test_uuid);
            expect(typeof resource).not.toBe(undefined);
            expect(typeof resource).toBe('object');
            expect(resource.constructor.name).toBe("PicSureHpdsResourceConnection");
            done();
        });
    });
    it("query()", (done) => {
        requirejs(["PicSure/Connector/Connector", "PicSure/Adapters/HPDS/Adapter"], function(PicSureClient, HpdsAdapter) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let test_uuid = "0000-0000-0000-0000";
            let conn = PicSureClient.connect(test_url, test_token);
            let adapter = HpdsAdapter.Adapter(conn);
            let resource = adapter.useResource(test_uuid);
            let query = resource.query();
            expect(typeof query).not.toBe(undefined);
            expect(typeof query).toBe('object');
            expect(query.constructor.name).toBe("PicSureHpdsQuery");
            done();
        });
    });
    it("dictionary()", (done) => {
        requirejs(["PicSure/Connector/Connector", "PicSure/Adapters/HPDS/Adapter"], function(PicSureClient, HpdsAdapter) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let test_uuid = "0000-0000-0000-0000";
            let conn = PicSureClient.connect(test_url, test_token);
            let adapter = HpdsAdapter.Adapter(conn);
            let resource = adapter.useResource(test_uuid);
            let dict = resource.dictionary();
            expect(typeof dict).not.toBe(undefined);
            expect(typeof dict).toBe('object');
            expect(dict.constructor.name).toBe("PicSureHpdsDictionary");
            done();
        });
    });
});

