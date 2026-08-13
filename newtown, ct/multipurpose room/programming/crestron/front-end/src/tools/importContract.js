const fs = require('fs');

let stateDigital= new Array();
let stateAnalog = new Array();
let stateSerial = new Array();

let eventDigital = new Array();
let eventAnalog = new Array();
let eventSerial = new Array();

try {

    var file = JSON.parse(fs.readFileSync('./src/contract/contract.cse2j', 'utf-8'));

    for(var signals in file)
    {
        if(signals === "signals")
        {
            for(var states in file[signals])
            {
                if(states === "states")
                {
                    for(var type in file[signals][states])
                    {
                        for(var smartGraphic in file[signals][states][type])
                        {
                            for(var signalName in file[signals][states][type][smartGraphic])
                            {
                                switch (type) {
                                    case "boolean":
                                        stateDigital.push(file[signals][states][type][smartGraphic][signalName]);
                                        break;
                                    case "numeric":
                                        stateAnalog.push(file[signals][states][type][smartGraphic][signalName]);
                                        break;
                                    case "string":
                                        stateSerial.push(file[signals][states][type][smartGraphic][signalName]);
                                        break;
                                }
                            }
                        }
                    }
                }
                else if(states === "events")
                {
                    for(var type in file[signals][states])
                    {
                        for(var signalName in file[signals][states][type])
                        {
                            switch (type) {
                                case "boolean":
                                    eventDigital.push(signalName);
                                    break;
                                case "numeric":
                                    eventAnalog.push(signalName);
                                    break;
                                case "string":
                                    eventSerial.push(signalName);
                                    break;
                            }	
                        }
                    }
                }
            }
        }
    }

} 
catch(error) {
    console.log('Contract file contains invalid JSON. Using empty contract file.');
}

const contract = {
    state:{
        digital:stateDigital,
        analog:stateAnalog,
        serial:stateSerial,
    },
    event:{
        digital:eventDigital,
        analog:eventAnalog,
        serial:eventSerial,
    }
};

fs.writeFileSync('./src/crestron/Contract.tsx', "const Contract = " + JSON.stringify(contract) + ";\nexport { Contract };"); 

