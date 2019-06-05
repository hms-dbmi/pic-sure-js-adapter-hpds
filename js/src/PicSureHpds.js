define([], function(PicSureHpds) {

    const PicSureHpdsAdapter = class {
        constructor(PicSureConnector) {
            this.connection_reference = PicSureConnector;
        }
        help() {}
        version() {}
        list() {
            this.connection_reference.list()
        }
        useResource(resource_uuid) {
            return (new PicSureHpdsResourceConnection(this.connection_reference, resource_uuid))
        }
    };


    const PicSureHpdsResourceConnection = class {
        constructor(connection, resource_uuid = null) {
            this.connection_reference = connection;
            this.resource_uuid = resource_uuid;
        }
        help() {}
        dictionary() {
            return (new PicSureHpdsDictionary(this));
        }
        query() {
            return (new PicSureHpdsQuery(this));
        }
    };


    const PicSureHpdsBypassAdapter = class {
        constructor(arg_url, arg_token = null) {
            let endpoint = String(arg_url).trim();
            if (endpoint.endsWith("/") === false) {
                endpoint = endpoint + "/";
            }
            this.url = endpoint;
            this.token = arg_token;
            this.connection_reference = new PicSureHpdsBypassConnection(this.url, this.token);
        }
        useResource(resource_uuid = null) {
            if (resource_uuid === null) {
                let temp  = new PicSureHpdsResourceConnection(this.connection_reference, false);
            } else {
                let temp  = new PicSureHpdsResourceConnection(this.connection_reference, resource_uuid);
            }
            return temp;
        }
        list() {
            this.connection_reference.list();
        }
        help() {}
    };


    const PicSureHpdsBypassConnection = class {
        constructor(arg_url, arg_token) {
            this.url = arg_url;
            this.token = arg_token;
        }
        list() {
            let res = this.getResources();
            alert("TODO: Display listing")
        }
        _api_obj() {
            return new PicSureConnectionAPI(this.url, this.token);
        }
        getResources() {}
        help() {}
    };


    const PicSureHpdsBypassConnectionAPI = class {
        constructor(arg_url, arg_token = false) {
            this.url = endpoint;
            this.token = arg_token;
        }
        info(resource_uuid) {}
        search(resource_uuid, query = false) {}
        synchQuery(resource_uuid, query) {}
        asynchQuery(resource_uuid, query) {}
        queryStatus(resource_uuid, query_uuid) {}
        queryResults(resource_uuid, query_uuid) {}
    };

});
