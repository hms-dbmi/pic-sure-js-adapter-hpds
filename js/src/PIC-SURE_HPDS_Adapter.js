define(["./PicSureHpds", "./PicSureHpdsDictionary", "./PicSureHpdsQuery"], function(PicSureHpds, PicSureHpdsDictionary, PicSureHpdsQuery) {
    return {
        "Adapter": (PicSureConnector) => { return (new PicSureHpds.PicSureHpdsAdapter(PicSureConnector)) },
        "BypassAdapter": (url, token) => { return (new PicSureHpds.PicSureHpdsBypassAdapter(url, token)) },
        "help": () => {
            console.group();
            console.log(`
Hpds.Adapter(PicSureConnector)              Return a HPDS Adapter instance that is configured to 
                                            use a pre-established PIC-SURE Connector object.
                                            
Hpds.BypassAdapter(EndpointURL, token)      Return a HPDS Adapter instance that is configured to 
                                            communicate directly with a HPDS endpoint.`);
            console.groupEnd();
        }
    };
});
