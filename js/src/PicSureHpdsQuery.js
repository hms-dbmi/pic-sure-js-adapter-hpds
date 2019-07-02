define(['d3-dsv', 'dataframe'], function(d3dsv, dfjs) {

//    dfjs = requirejs('dataframe');

    const PicSureHpdsQuery = class {
        // -------------------------------
        constructor(connection) {
            this._lstSelect = new HpdsAttribListKeys({
                help_text: `
myQuery.select()
    .add("key")            add a single column to be returned in results
    .delete("key")         delete a single column from the list of columns to return
    .show()                lists all current columns that will be returned in results
    .clear()               clears all values from the select list`
            });
            this._lstRequire = new HpdsAttribListKeys({
                help_text: `
myQuery.require()
    .add("key")            add a single column that must exist within each results record
    .delete("key")         delete a single column from the list of columns to that results records must have
    .show()                lists all current columns that results records must have
    .clear()               clears all values from the require list`
            });
            this._lstFilter = new HpdsAttribListKeyValues({
                help_text: `
myQuery.filter()
    .add("key", {"value": value})                         - or -
    .add("key", {"category":["value"]})                   filter to records with KEY column that equals VALUE
    .add("key", {"category":["value1", "value2"]})        filter to records with KEY column equalling one value within the given list
    .add("key", {"min": value_start, "max": value_end} )  filter to records with KEY column value between MIN & MAX (inclusive)
                                                          min -or- max may not be set to filter by only a max or min value
    
    .delete("key")                     delete a filter from the list of filters
    .show()                            lists all current filters that results records must satisfy
    .clear()                           clears all values from the filters list`
            });
            this.connection = connection;
            this.resourceUUID = connection.resource_uuid;
            this.INTERNAL_API_OBJ = connection.connection_reference._api_obj();
            this.performance = {
                "running": false,
                "tmr_start": 0,
                "tmr_query": 0,
                "tmr_recv": 0,
                "tmr_proc": 0
            };
            try {
                if (typeof(window.performance.now) !== 'undefined') {
                    this.performance["now"] = function() {
                        return window.performance.now();
                    }
                } else {
                    throw Error("fallback to seconds")
                }
            } catch (e) {
                this.performance["now"] = function() {
                    return (Date.now() * 1000);
                }
            }
        }
        // -------------------------------
        show() { console.dir(this.buildQuery()); }
        // -------------------------------
        select() {
            if (arguments.length !== 0) {
                console.warn("Did you mean XYZ.select().add(key, value)")
            } else {
                return this._lstSelect;
            }
        }
        // -------------------------------
        require() {
            if (arguments.length !== 0) {
                console.warn("Did you mean XYZ.require().add(key, value)")
            } else {
                return this._lstRequire;
            }
        }
        // -------------------------------
        filter() {
            if (arguments.length !== 0) {
                console.warn("Did you mean XYZ.filter().add(key, value)")
            } else {
                return this._lstFilter;
            }
        }
        // -------------------------------
        getCount() {
            this.performance.running = true;
            this.performance["tmr_start"] = this.performance.now();
            // return a jQuery "promise"
            return jQuery.Deferred((defer) => {
                let queryJSON = JSON.stringify(this.buildQuery("COUNT"));
                this.performance["tmr_query"] = this.performance.now();
                let httpResults = false;
                this.INTERNAL_API_OBJ.syncQuery(this.resourceUUID, queryJSON)
                    .then((results) => {
                        this.performance["tmr_recv"] = this.performance.now();
                        this.performance.running = false;
                        httpResults = parseInt(results);
                        this.performance["tmr_proc"] = this.performance.now();
                        // return the results via Promise mechanism
                        defer.resolve(httpResults);
                    });
            }).promise();
        }
        // -------------------------------
        getResults() {
            this.performance.running = true;
            this.performance["tmr_start"] = this.performance.now();
            // return a jQuery "promise"
            return jQuery.Deferred((defer) => {
                let queryJSON = JSON.stringify(this.buildQuery("DATAFRAME"));
                this.performance["tmr_query"] = this.performance.now();
                let httpResults = false;
                this.INTERNAL_API_OBJ.syncQuery(this.resourceUUID, queryJSON)
                    .then((results) => {
                        this.performance["tmr_recv"] = this.performance.now();
                        this.performance.running = false;
                        httpResults = String(results);
                        this.performance["tmr_proc"] = this.performance.now();
                        // return the results via Promise mechanism
                        defer.resolve(httpResults);
                    });
            }).promise();
        }
        // -------------------------------
        getResultsDataFrame() {
            // Implemented Using -> https://github.com/Gmousse/dataframe-js
            //                   -> https://github.com/d3/d3-dsv
            this.performance.running = true;
            this.performance["tmr_start"] = this.performance.now();
            // return a jQuery "promise"
            return jQuery.Deferred((defer) => {
                let queryJSON = JSON.stringify(this.buildQuery("DATAFRAME"));
                this.performance["tmr_query"] = this.performance.now();
                let httpResults = false;
                this.INTERNAL_API_OBJ.syncQuery(this.resourceUUID, queryJSON)
                    .then((results) => {
                        this.performance["tmr_recv"] = this.performance.now();
                        this.performance.running = false;
                        httpResults = String(results);
                        // parse into a dataframe object
                        let data = d3dsv.csvParseRows(httpResults);
                        const column_names = data.shift();
                        let df = new dfjs.DataFrame(data, column_names);
                        this.performance["tmr_proc"] = this.performance.now();
                        // return the results via Promise mechanism
                        defer.resolve(df);
                    });
            }).promise();
        }
        // -------------------------------
        getRunDetails() {
            let ret = {"running": this.performance.running};
            if (!this.performance.running) {
                if (this.performance.tmr_query > this.performance.tmr_start) ret["query_build"] = this.performance.tmr_query - this.performance.tmr_start;
                if (this.performance.tmr_recv > this.performance.tmr_query) ret["query_exec"] = this.performance.tmr_recv - this.performance.tmr_query;
                if (this.performance.tmr_proc > this.performance.tmr_recv) ret["result_process"] = this.performance.tmr_proc - this.performance.tmr_recv;
            }
            console.dirxml(ret);
            return ret;
        }
        // -------------------------------
        getQueryCommand(format = false) {
            return JSON.stringify(this.buildQuery(format))
        }
        // -------------------------------
        buildQuery(format = false) {
            let temp;
            let ret = {
                "query": {
                    "fields": [],
                    "requiredFields": [],
                    "numericFilters": {},
                    "categoryFilters": {},
                }
            };
            ret['query']['fields'] = this._lstSelect.getQueryValues();
            ret['query']['requiredFields'] = this._lstRequire.getQueryValues();
            temp = this._lstFilter.getQueryValues();
            ret['query']['numericFilters'] = temp['numericFilters'];
            ret['query']['categoryFilters'] = temp['categoryFilters'];
            if (typeof this.resourceUUID !== "undefined") ret['resourceUUID'] = this.resourceUUID;
            if (format !== false) ret['query']['expectedResultType'] = format;
            return ret;
        }
        // -------------------------------
        help() {
            console.group();
            console.log(`
[HELP] PicSureHpdsLib.Adapter(connection).useResource(uuid).query()
    .select()   list of data fields to return from resource for each record
    .require()  list of data fields that must be present in all returned records
    .filter()   list of data fields and conditions that returned records satisfy
                [ Filter keys exert an AND relationship on returned records      ]
                [ Categorical values have an OR relationship on their key        ]
                [ Numerical Ranges are inclusive of their start and end points   ]\n
    .getCount()             returns a count indicating the number of matching numbers
    .getResults()           returns a CSV-like string containing the matching records
    .getResultsDataFrame()  returns a DataFrame containing the matching records
    .getRunDetails()        returns details about the last run of the query
    .getQueryCommand()      returns the JSON-formatted query request
    .show()                 lists all current query parameters\n
                * .getCount(), .getResults(), and .getResultsDataFrame() functions can
                also accept options that run queries differently which might help with
                connection timeouts. Example: myQry.getResults({async:true, timeout:60}`);
            console.groupEnd();
        }
    };


    const HpdsAttribList = class {
        // -------------------------------
        constructor(options, default_list = false) {
            if (typeof(options.help_text) === 'undefined') {
                this.helpstr = `
                    [Help] valid commands are:
                    |    add(): add a value
                    |  delete(): delete a value
                    |   show(): lists all current values
                    |  clear(): clears all values from list
                    |   help(): this command...
                `;
            } else {
                this.helpstr = options.help_text
            }
            if (default_list === false) {
                this.data  = {}
            } else {
                this.data = default_list;
            }

        }
        // -------------------------------
        add(arg_key, arg_options = false) {
            let options = {};
            let keys = [];
            if (arg_options !== false) {
                if (typeof arg_options === 'object' && !Array.isArray(arg_options)) {
                    options = arg_options;
                } else {
                    console.warn("Did not add options because it is an array");
                }
            }
            if (Array.isArray(arg_key)) {
                keys = arg_key;
            } else {
                keys.push(arg_key);
            }

            // process simple key adds
            if  (Object.keys(options).length === 0) {
                for (let key of keys) {
                    if (typeof this.data[key] !== 'undefined') {
                        console.warn('ERROR: cannot add, key already exists -> ' + key);
                    } else {
                        this.data[key] = {"type": "exists"};
                    }
                }
            } else {
                // process categorical add
                if (typeof options['category'] !== 'undefined' ) {
                    for (let key of keys) {
                        if (typeof this.data[key] !== 'undefined') {
                            console.warn('ERROR: cannot add, key already exists -> ' + key);
                        } else {
                            if (Array.isArray(options['category'])) {
                                this.data[key] = {"type": "categorical", "values": options['category'] };
                            } else {
                                this.data[key] = {"type": "categorical", "values": [options['category']] };
                            }
                        }
                    }
                } else {
                    // process min and/or max add
                    if (typeof options['min'] !== 'undefined' || typeof options['max'] !== 'undefined') {
                        let entry = {"type": "minmax"};
                        if (typeof options['min'] !== 'undefined') entry['min'] = options['min'];
                        if (typeof options['max'] !== 'undefined') entry['max'] = options['max'];
                        for (let key of keys) {
                            if (typeof this.data[key] !== 'undefined') {
                                console.warn('ERROR: cannot add, key already exists -> ' + key);
                            } else {
                                this.data[key] = entry;
                            }
                        }
                    } else {
                        // process single value add
                        if (typeof options['value'] !== 'undefined') {
                            for (let key of keys) {
                                if (typeof this.data[key] !== 'undefined') {
                                    console.warn('ERROR: cannot add, key already exists -> ' + key);
                                } else {
                                    this.data[key] = {"type": "value", "value": options['value'] };
                                }
                            }
                        }
                    }
                }
            }
            return this;
        }
        // -------------------------------
        delete(arg_key, arg_options = false) {
            let options = {};
            let keys = [];
            if (arg_options !== false) {
                if (typeof arg_options === 'object' && !Array.isArray(arg_options) && Array.isArray(arg_options['category'])) {
                    options = arg_options;
                } else {
                    console.warn("Did not delete key+category because options is not {'category':[x,y,z]} type");
                    return false;
                }
            }
            if (Array.isArray(arg_key)) {
                keys = arg_key;
            } else {
                keys.push(arg_key);
            }

            // simple delete of key(s)
            if  (Object.keys(options).length === 0) {
                for (let key of keys) {
                    if (typeof this.data[key] === 'undefined') {
                        console.warn('ERROR: cannot delete, key does not exist -> ' + key);
                    } else {
                        delete this.data[key];
                    }
                }
            } else {
                // deleting one or more values from the listed key(s)
                for (let key of keys) {
                    if (typeof this.data[key] === 'undefined') {
                        console.warn('ERROR: cannot delete, key does not exist -> ' + key);
                    } else {
                        if (this.data[key].type !== "categorical") {
                            console.warn('ERROR: cannot delete category value, key is not categorical -> ' + key);
                        } else {
                            // filter out any values that are in the options['category'] array
                            this.data[key].values = this.data[key].values.filter((val) => { return (options['category'].indexOf(val) === -1); });
                        }
                    }
                }
            }
        }
        // -------------------------------
        show() {
            console.group();
            for (let key of this.data) {
                console.dirxml(this.data[key]);
            }
            console.groupEnd();
        }
        // -------------------------------
        clear() {
            this.data = {};
        }
        // -------------------------------
        help() {
            console.log(this.helpstr);
        }
        // -------------------------------
        getQueryValues() { return false; } // SHOULD BE IMPLEMENTED IN SUBCLASSES
    };


    const HpdsAttribListKeys = class extends HpdsAttribList {
        // -------------------------------
        constructor(options, default_list = false) {
            super(options, default_list);
        }
        // -------------------------------
        add(arg_key, arg_options = false) { super.add(arg_key, arg_options); }
        // -------------------------------
        delete(arg_key, arg_options = false) { super.delete(arg_key, arg_options); }
        // -------------------------------
        getJSON() { return JSON.stringify(this.getQueryValues()); }
        // -------------------------------
        getQueryValues() {
            let key;
            let ret = [];
            for (key in this.data) {
                if (this.data[key].type === "exists") {
                    ret.push(key);
                }
            }
            return ret;
        }
    };


    const HpdsAttribListKeyValues = class extends HpdsAttribList {
        // -------------------------------
        constructor(options, default_list = false) {
            super(options, default_list);
        }
        // -------------------------------
        add(arg_key, arg_options = false) { super.add(arg_key, arg_options); }
        // -------------------------------
        delete(arg_key, arg_options = false) { super.delete(arg_key, arg_options); }
        // -------------------------------
        getJSON() { return JSON.stringify(this.getQueryValues()); }
        // -------------------------------
        getQueryValues() {
            let key;
            let rec;
            let ret;
            ret = {"numericFilters": {}, "categoryFilters": {}};
            for (key in this.data) {
                rec = this.data[key];
                switch (this.data[key].type) {
                    case "minmax":
                        ret["numericFilters"][key] = {};
                        if (typeof rec.min !== "undefined") {
                            ret["numericFilters"][key].min = rec.min;
                        }
                        if (typeof rec.max !== "undefined") {
                            ret["numericFilters"][key].max = rec.max;
                        }
                        break;
                    case "categorical":
                        ret["categoryFilters"][key] = rec.values;
                        break;
                    case "value":
                        if (typeof rec.value === "string") {
                            ret["categoryFilters"][key] = [rec.value];
                        } else {
                            ret["numericFilters"][key] = {"min": rec.value, "max": rec.value };
                        }
                        break;
                }
            }
            return ret;
        }
    };

    // ---------------------------------------------------------------
    return PicSureHpdsQuery;
    // ---------------------------------------------------------------
});
