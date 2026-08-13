This is a react project that supports Crestron SIMPL Windows integration.

[CRESTRON PROCESSOR INSTRUCTIONS]

HTML5 Xpanel:
https://sdkcon78221.crestron.com/sdk/Crestron_HTML5UI/Content/Topics/Platforms/X-CS-Settings.htm

Crestron Control App:
https://www.crestron.com/getmedia/79951a60-d8f8-4590-8c83-2aafe63b7714/mg_pm_crestron-control-app-zoom-rooms-software

For hosting project on device (like an iPad) requiring SSL CA:
https://github.com/VisionPoint/Crestron_CA_Certificate

[REACT PROJECT INFORMATION]

.env file - define which Crestron control systems are allowed to connect to the project, along with which system should be active.

REACT_APP_SYSTEMS: Array<{
    "name": system name,
    "ipId": ip id associated in crestron the program for WebXpanel HTML5 ethernet device,
    "projectName": used to statically load system by comparing to REACT_APP_STATIC_PROJECT_NAME variable. when matched will statically load that system, regardless of system name/ip id
}>

REACT_APP_CONTROLSYSTEMS: Array<{
    "localhost": boolean that, when true, allows project to be hosted on localhost,
    "hostname": hostname of crestron control processor hosting program,
    "websocketToken": websocketToken of crestron control processor hosting program,
}>

REACT_APP_UNIVERSAL_PROJECT_NAME: string - this will be the name of the archive file that will allow any system to be accessed by providing the correct query param in the url

Example
http://localhost:3000/?system=System%201 will load the REACT_APP_SYSTEM defined with propery "name" = 'System 1'

REACT_APP_STATIC_PROJECT_NAME: string - set to force the project to load the system associated with this name. when building with 'npm run build', the static archive projects will automatically be compiled for the REACT_APP_SYSTEMS with the property "projectName" defined.

App.tsx
assign which JSX.Element should be loaded for each defined system. If there is no system identified, the project will inform the user when loaded. Check the .env credentials and verify they are correct, and the system name used in App.tsx for identification matches.

Example
var System1 = <div>System1</div>;
var System2 = <div>System2</div>;

switch (props.System.name) {
    case "System 1": {
        app = System1;
        break;
    }
    case "System2": {
        app = System2;
        break;
    }
}

Import the functions from 'src\components\crestron\CrComLib.tsx' to communicate with a Crestron digital/analog/serial signals.

Example
const [dig6] = useCrestronDigitalSubscribe({ name: '6' });