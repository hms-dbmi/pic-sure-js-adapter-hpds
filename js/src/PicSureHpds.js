define(["./PicSureHpdsDictionary", "./PicSureHpdsQuery"], function(PicSureHpdsDictionary, PicSureHpdsQuery) {

    const _library_version = "0.8.0";

    const PicSureHpdsAdapter = class {
        // -------------------------------
        constructor(PicSureConnector) {
            this.connection_reference = PicSureConnector;
        }
        // -------------------------------
        list() {
            this.connection_reference.list()
        }
        // -------------------------------
        useResource(resource_uuid) {
            return (new PicSureHpdsResourceConnection(this.connection_reference, resource_uuid))
        }
        // -------------------------------
        version() {
            console.log("PIC-SURE HPDS Adapter Library ( version " + _library_version + " )");
        }
        // -------------------------------
        help() {
            console.group();
            console.log(`
[HELP] PicSureHpdsLib.Adapter(picsure_connection)
    .version()                      gives version information for library
    .list()                         lists available resources
    .useResource(resource_uuid)     returns an object for selected resource`);
            console.groupEnd();
        }
    };


    const PicSureHpdsResourceConnection = class {
        // -------------------------------
        constructor(connection, resource_uuid = null) {
            this.connection_reference = connection;
            this.resource_uuid = resource_uuid;
        }
        // -------------------------------
        dictionary() {
            return (new PicSureHpdsDictionary(this));
        }
        // -------------------------------
        query() {
            return (new PicSureHpdsQuery(this));
        }
        // -------------------------------
        help() {
            console.group();
            console.log(`
[HELP] PicSureHpdsLib.Adapter.useResource(resource_uuid)
    .dictionary()       Used to access data dictionary of the resource
    .query()            Used to query against data in the resource`
                + "\n\n[ENVIRONMENT]"
                + "\n              URL: " + this.connection_reference.url
                + "\n    Resource UUID: " + this.resource_uuid);
            console.groupEnd();
        }
    };


    const PicSureHpdsBypassAdapter = class {
        // -------------------------------
        constructor(arg_url, arg_token = null) {
            let endpoint = String(arg_url).trim();
            if (endpoint.endsWith("/") === false) {
                endpoint = endpoint + "/";
            }
            this.url = endpoint;
            this.token = arg_token;
            this.connection_reference = new PicSureHpdsBypassConnection(this.url, this.token);
        }
        // -------------------------------
        useResource(resource_uuid = null) {
            if (resource_uuid === null) {
                let temp  = new PicSureHpdsResourceConnection(this.connection_reference, false);
            } else {
                let temp  = new PicSureHpdsResourceConnection(this.connection_reference, resource_uuid);
            }
            return temp;
        }
        // -------------------------------
        list() {
            this.connection_reference.list();
        }
        // -------------------------------
        help() {
            console.group();
            console.log(`
[HELP] PicSureHpdsLib.BypassAdapter(HPDS_Url, Security_Token)
    .version()                      gives version information for library
    .list()                         lists available resources
    .useResource(resource_uuid)     returns an object for selected resource`);
            console.groupEnd();
        }
    };


    const PicSureHpdsBypassConnection = class {
        // -------------------------------
        constructor(arg_url, arg_token = null) {
            this.url = arg_url;
            this.token = arg_token;
        }
        // -------------------------------
        list() {
            this.getResources().done((data) => {
                console.group();
                console.warn("Listing for resources at "+this.url+":");
                data.forEach((rec) => {
                    console.dirxml(rec);
                });
                console.groupEnd();
            }).fail(()=>{
                console.error("Failed to get list of resources");
            });
        }
        // -------------------------------
        _api_obj() {
            return new PicSureHpdsBypassConnectionAPI(this.url, this.token);
        }
        // -------------------------------
        getResources() {
            const retDeferred = jQuery.Deferred();
            jQuery.ajax({
                url: this.url + "info/resources",
                method: "GET",
                dataType: "text",
                contentType: "application/json",
                beforeSend: (xhr) => {
                    if (this.token !== null) {
                        xhr.setRequestHeader("Authorization", "Bearer "+this.token);
                    }
                }
            }).done((data, textStatus, jqXHR) => {
                retDeferred.resolve(data);
            }).fail((jqXHR, textStatus, errorThrown)=>{
                retDeferred.reject(textStatus);
            });
            return retDeferred.promise();
        }
        // -------------------------------
        help() {
            console.group();
            console.log(`
[HELP] PicSureHpdsLib.BypassConnection(url, token)
    .list()                 List resources
    .help()                 Show help`);
            console.groupEnd();
        }
    };


    const PicSureHpdsBypassConnectionAPI = class {
        // -------------------------------
        constructor(arg_url, arg_token = false) {
            let endpoint = String(arg_url).trim();
            if (endpoint.endsWith("/") === false) {
                endpoint = endpoint + "/";
            }
            this.url = endpoint;
            this.token = arg_token;
        }
        // -------------------------------
        info(resource_uuid){
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L43
            const url = this.url + "info/" + String(resource_uuid)
            return (new Promise((resolve, reject) => {
                jQuery.ajax({
                    method: "POST",
                    contentType: "application/json",
                    url: url,
                    data: "{}",
                    dataType: "text",
                    beforeSend: (xhr) => {
                        xhr.setRequestHeader("Authorization", "Bearer "+this.token);
                    }
                }).done((data, textStatus, jqXHR) => {
                    resolve(data);
                    return data;
                }).fail((jqXHR, textStatus, errorThrown) => {
                    let ret = "[]";
                    reject(ret);
                    return ret;
                });
            }));
        }
        // -------------------------------
        search(resource_uuid, query = false) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L69
            const url = this.url + "search/" + String(resource_uuid);
            if (query === false) {
                var query_data = {"query":""};
            } else {
                var query_data = String(query);
            }

            return (new Promise((resolve, reject) => {
                jQuery.ajax({
                    method: "POST",
                    contentType: "application/json",
                    url: url,
                    data: query_data,
                    dataType: "text",
                    beforeSend: (xhr) => {
                        xhr.setRequestHeader("Authorization", "Bearer "+this.token);
                    }
                }).done((data, textStatus, jqXHR) => {
                    resolve(data);
                    return data;
                }).fail((jqXHR, textStatus, errorThrown) => {
                    let ret = '{"results":{}, "error":"true"}';
                    reject(ret);
                    return ret;
                });
            }));
        }
        // -------------------------------
        syncQuery(resource_uuid, query) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L186
            const url = this.url + "query/sync";
            return (new Promise((resolve, reject) => {
                jQuery.ajax({
                    method: "POST",
                    contentType: "application/json",
                    url: url,
                    data: String(query),
                    dataType: "text",
                    beforeSend: (xhr) => {
                        xhr.setRequestHeader("Authorization", "Bearer "+this.token);
                    }
                }).done((data, textStatus, jqXHR) => {
                    resolve(data);
                    return data;
                }).fail((jqXHR, textStatus, errorThrown) => {
                    let ret = '{"results":{}, "error":"true"}';
                    reject(ret);
                    return ret;
                });
            }));
        }
        // -------------------------------
        asyncQuery(resource_uuid, query) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L98
        }
        // -------------------------------
        queryStatus(resource_uuid, query_uuid) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L124

        }
        // -------------------------------
        queryResult(resource_uuid, query_uuid) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L155
        }
    };

    // ---------------------------------------------------------------
    return {
        "PicSureHpdsAdapter": PicSureHpdsAdapter,
        "PicSureHpdsBypassAdapter": PicSureHpdsBypassAdapter
    };
    // ---------------------------------------------------------------

});
