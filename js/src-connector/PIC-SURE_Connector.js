/**
 * Created by nbeni on 5/17/2019.
 */
define([], function() {

    let _PicSureApiVersion = "0.1.0";
    const Connection = class {
        constructor(arg_url, arg_token) {
            let endpoint = String(arg_url).trim();
            if (endpoint.endsWith("/") === false) {
                endpoint = endpoint + "/";
            }
            this.url = endpoint;
            this.token = arg_token;
        }

        static help() {
            console.log(`
        [HELP] PicSureClient.connect(url, token)
            .list()                         Prints a list of available resources
            .about(resource_uuid)           Prints details about a specific resource
            
        [Connect to Resource]
            To connect to a resource load its associated resource code library
            and then pass the API connection object (this object) to the
            the library's Client object like this:
            
            myPicSureConn = PicSureClient.connect(url, token);
            PicSureHpdsLib.Adapter(myPicSureConn).then((result) => { myResourceAdapter = result });
            myResource = myResourceAdapter.useResource(resource_uuid);
            myResource.help();
            
            * The above example connects to a HPDS resource.  Each resource has
              a specific type which has its own adapter library.  Libraries will
              follow the naming convention: "PicSureXyzLib" where "Xyz" 
              specifies the adapter's storage format.
            `)
        }

        about(resourceId) {
            let url = this.url + "info/";
            if (typeof(resourceId) === "undefined") {
                url = url + "resources"
            } else {
                url = url + String(resourceId)
            }

            let d = new jQuery.Deferred();
            jQuery.ajax({
                method: "GET",
                url: url,
                beforeSend: (xhr) => {
                    xhr.setRequestHeader("Authorization", "Bearer " + this.token);
                }
            }).done((data, textStatus, jqXHR) => {
                let ret = {"error": false, "headers": jqXHR.getAllResponseHeaders().split("\n"), "content": data};
                d.resolve(JSON.stringify(ret));
                return JSON.stringify(ret);
            }).fail((jqXHR, textStatus, errorThrown) => {
                let ret = {
                    "error": true,
                    "headers": jqXHR.getAllResponseHeaders().split("\n"),
                    "content": errorThrown
                };
                d.reject(JSON.stringify(ret));
                return JSON.stringify(ret);
            });
            return d.promise();
        }

        async list() {
            let listing = await this.getResources();
            listing = JSON.parse(listing);
            console.group();
            console.warn("Listing for resources at " + this.url + ":");
            for (let rec of listing) {
                console.dirxml(rec);
            }
            console.groupEnd();
        }

        static getInfo() {
            return false;
        }

        getResources() {
            const url = this.url + "info/resources";
            let d = new jQuery.Deferred();
            jQuery.ajax({
                method: "GET",
                dataType: "text",
                url: url,
                beforeSend: (xhr) => {
                    xhr.setRequestHeader("Authorization", "Bearer " + this.token);
                }
            }).done((data, textStatus, jqXHR) => {
                d.resolve(data);
                return data;
            }).fail((jqXHR, textStatus, errorThrown) => {
                let ret = "[]";
                d.reject(ret);
                return ret;
            });
            return d.promise();
        }

        _api_obj() {
            return new PicSureConnectionAPI(this.url, this.token);
        }
    };


    let PicSureConnectionAPI = class {
        constructor(url, token) {
            this.url = url;
            this.token = token;
        }
        info(resource_uuid){
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L43
            const url = this.url + "info/" + String(resource_uuid);

            let d = new jQuery.Deferred();
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
                d.resolve(data);
                return data;
            }).fail((jqXHR, textStatus, errorThrown) => {
                let ret = "[]";
                d.reject(ret);
                return ret;
            });
            return d.promise();
        }
        search(resource_uuid, query = false) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L69
            let query_data;
            const url = this.url + "search/" + String(resource_uuid);
            if (query === false) {
                query_data = {"query": ""};
            } else {
                query_data = String(query);
            }

            let d = new jQuery.Deferred();
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
                d.resolve(data);
                return data;
            }).fail((jqXHR, textStatus, errorThrown) => {
                let ret = '{"results":{}, "error":"true"}';
                d.reject(ret);
                return ret;
            });
            return d.promise();
        }
        syncQuery(resource_uuid, query) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L186
            const url = this.url + "query/sync";
            let d = new jQuery.Deferred();
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
                d.resolve(data);
                return data;
            }).fail((jqXHR, textStatus, errorThrown) => {
                let ret = '{"results":{}, "error":"true"}';
                d.reject(ret);
                return ret;
            });
            return d.promise();
        }
        asyncQuery(resource_uuid, query) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L98
        }
        queryStatus(resource_uuid, query_uuid) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L124

                }
        queryResult(resource_uuid, query_uuid) {
            // make sure a Resource UUID is passed via the body of these commands
            // ### https://github.com/hms-dbmi/pic-sure/blob/master/pic-sure-resources/pic-sure-resource-api/src/main/java/edu/harvard/dbmi/avillach/service/ResourceWebClient.java#L155
        }
    };


    // below this line is for the returned "PicSure.Client" class
    // --------------------------------------------------------------------------------------------------------------
    let _version = () => {
        console.log("PicSureClient Javascript Library (version " + _PicSureApiVersion + ")");
    };

    let _help = () => {
        console.log(`
                    PicSureClient.version()                 give version information for the library
                    PicSureClient.connect(<url>, <token>)   returns a connection object instance
                    `);
    };

    let _connect = (url, token) => {
        return new Connection(url, token);
    };

    return {
            version: _version,
            help: _help,
            connect: _connect
        };
});
