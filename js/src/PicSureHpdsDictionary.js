define([], function() {

    const PicSureHpdsDictionary = class {
        // -------------------------------
        constructor(ref_HpdsResourceConnection) {
            this._refResourceConnection = ref_HpdsResourceConnection;
            this.resource_uuid = ref_HpdsResourceConnection.resource_uuid;
            this._api_obj = ref_HpdsResourceConnection.connection_reference._api_obj();
        }
        // -------------------------------
        find(term = null) {
            const retDeferred = jQuery.Deferred();

            let query = {"query": ""};
            if (term !== null) {
                query["query"] = String(term);
            }

            this._api_obj.search(this.resource_uuid, JSON.stringify(query))
                .then(
                    (data) => {
                        retDeferred.resolve((new PicSureHpdsDictionaryResult(data)));
                    },
                    (err)=>{
                        retDeferred.reject(err);
                    });
            return retDeferred.promise();
        }
        // -------------------------------
        help() {
            console.group();
            console.log(`
[HELP] PicSureHpdsLib.Adapter(connection).useResource(uuid).dictionary()
    .find()                 Lists all data dictionary entries
    .find(search_string)    Lists matching data dictionary entries`);
            console.groupEnd();
        }
    };


    const PicSureHpdsDictionaryResult = class {
        // -------------------------------
        constructor(json_data = null) {
            this.results = JSON.parse(json_data);
            if (typeof(this.results.results["phenotypes"]) !== 'undefined') {
                newResults = {}
                for (resultType in this.results.results) {
                    for (idx in this.results.results[resultType]) {
                        this.results.results[resultType][idx]['HpdsDataType'] = resultType;
                        newResults[idx] = this.results.results[resultType][idx];
                    }
                }
                this.results.results = newResults;
            }
        }
        // -------------------------------
        count() {
            return Object.keys(this.results.results).length;
        }
        // -------------------------------
        keys() {
            return Object.keys(this.results.results);
        }
        // -------------------------------
        entries() {
            return Object.values(this.results.results);
        }
        // -------------------------------
        DataFrame() {
            console.warn("Not Yet Implemented: https://github.com/Gmousse/dataframe-js");
            return this.results.results;
        }
        // -------------------------------
        help() {
            console.group();
            console.log(`
[HELP] PicSureHpdsLib.Adapter(connection)$useResource(uuid)$dictionary()$find(term)
    .count()        Returns the number of entries in the dictionary that match the given term
    .keys()         Return the keys of the matching entries
    .entries()      Return a list of matching dictionary entries
    .DataFrame()    Return the entries in a DataFrame-compatible format
[Examples]
    results = PicSureHpdsLib.Adapter(connection).useResource(uuid).dictionary().find('asthma');
    df = results.DataFrame();`);
            console.groupEnd();
        }
    };

    // ---------------------------------------------------------------
    return PicSureHpdsDictionary;
    // ---------------------------------------------------------------
});
