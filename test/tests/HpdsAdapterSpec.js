/**
 * Created by nbenik on 12/12/2019.
 */

describe("[Adapter Object creation]", () => {
    it("created normal adapter w/connector passing", (done) => {
        requirejs(["PicSure/Connector/Connector", "PicSure/Adapters/HPDS/Adapter"], function(PicSureClient, HpdsAdapter) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let conn = PicSureClient.connect(test_url, test_token);
            let adapter = HpdsAdapter.Adapter(conn);
            expect(typeof adapter).not.toBe(undefined);
            expect(typeof adapter).toBe('object');
            expect(adapter.constructor.name).toBe("PicSureHpdsAdapter");
            expect(adapter.connection_reference.url).toBe(test_url);
            expect(adapter.connection_reference.token).toBe(test_token);
            done();
        });
    });
    it("created Bypass Adapter", (done) => {
        requirejs(["PicSure/Adapters/HPDS/Adapter"], function(HpdsAdapter) {
            let test_url = "http://some.url/PIC-SURE/";
            let test_token = "some_jwt_token";
            let adapter = HpdsAdapter.BypassAdapter(test_url, test_token);
            expect(typeof adapter).not.toBe(undefined);
            expect(typeof adapter).toBe('object');
            expect(adapter.constructor.name).toBe("PicSureHpdsBypassAdapter");
            expect(adapter.connection_reference.url).toBe(test_url);
            expect(adapter.connection_reference.token).toBe(test_token);
            done();
        });
    });
});

describe("[Adapter help function]", () => {
    it("display help test for HPDS adapter", (done) => {
        requirejs(["PicSure/Adapters/HPDS/Adapter"], function (HpdsAdapter) {
            spyOn(console, "log");
            HpdsAdapter.help();
            expect(console.log).toHaveBeenCalled();
            done();
        });
    });
});
