const https = require('https')
const querystring = require('querystring');

const endpointID = 'net.cdzombak.home.gd'

function toggleGD() {
    return new Promise((resolve, reject) => {
        const data = querystring.stringify({
            api_key: process.env.API_KEY
        })
        const options = {
          hostname: 'gd.home.cdzombak.net',
          path: '',
          protocol: 'https:',
          port: '443',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
          },
          auth: process.env.AUTHORIZATION
        }
        console.log(`DEBUG[toggleGD]: POSTing body '${data}' to ${options['hostname']}${options['path']}`)
        const request = https.request(options, response => {
            response.setEncoding('utf8');
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')}${response.req.path}`));
            }

            let returnData = '';
            response.on('data', chunk => {
                returnData += chunk;
            });
            response.on('end', () => {
                resolve(JSON.parse(returnData));
            });
            response.on('error', error => {
                reject(error);
            });
        });
        request.write(data)
        request.end()
    });
}

exports.handler = function (request, context) {
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        console.log(`DEBUG[handler]: received Discovery request: ${JSON.stringify(request)}`);
        handleDiscovery(request, context);
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController') {
        if (request.directive.header.name === 'TurnOn' || request.directive.header.name === 'TurnOff') {
            console.log(`DEBUG[handler]: received TurnOn or TurnOff request: ${JSON.stringify(request)}`);
            handlePowerControl(request, context);
        }
    }

    function handleDiscovery(request, context) {
        const payload = {
            "endpoints": [
                {
                    "endpointId": endpointID,
                    "manufacturerName": "home.cdzombak.net",
                    "friendlyName": "Garage Door Button",
                    "description": "Remote control button for the garage door. Supports 'turn on'/'activate' only.",
                    "displayCategories": ["SWITCH"],
                    "cookie": {},
                    "capabilities":
                    [
                        {
                          "type": "AlexaInterface",
                          "interface": "Alexa",
                          "version": "3"
                        },
                        {
                            "interface": "Alexa.PowerController",
                            "version": "3",
                            "type": "AlexaInterface",
                            "properties": {
                                "supported": [{
                                    "name": "powerState"
                                }],
                                "retrievable": false
                            }
                        }
                    ]
                }
            ]
        };
        let header = request.directive.header;
        header.name = "Discover.Response";
        const event = { header: header, payload: payload }
        console.log(`DEBUG[discovery]: response: ${JSON.stringify(event)}`);
        context.succeed({ event: event });
    }

    async function handlePowerControl(request, context) {
        const requestMethod = request.directive.header.name;

        if (requestMethod === "TurnOn") {
            console.log(`DEBUG[powerControl]: attempting to call gd.home.cdzombak.net API`);
            try {
                const resp = await toggleGD()
                console.log(`DEBUG[powerControl]: received response ${resp}`)
                sendSuccessResponse(request, context)
            } catch(err) {
                console.log(`DEBUG[powerControl]: received error ${err}`)

            }
        } else {
            console.log(`DEBUG[powerControl]: got unsupported request method ${requestMethod} (only 'TurnOn' is supported)`);
            sendSuccessResponse(request, context)
        }
    }

    function sendSuccessResponse(request, context) {
        // get user token passed in request
        const requestToken = request.directive.endpoint.scope.token;

        let responseHeader = request.directive.header;
        responseHeader.namespace = "Alexa";
        responseHeader.name = "Response";
        responseHeader.messageId = responseHeader.messageId + "-R";

        const contextResult = {
            "properties": [{
                "namespace": "Alexa.PowerController",
                "name": "powerState",
                "value": "OFF",
                "timeOfSample": new Date().toISOString(),
                "uncertaintyInMilliseconds": 50
            }]
        };
        const response = {
            context: contextResult,
            event: {
                header: responseHeader,
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: requestToken
                    },
                    endpointId: endpointID
                },
                payload: {}
            }
        };

        console.log(`DEBUG[powerControl]: sending success (power OFF) response: ${JSON.stringify(response)}`);
        context.succeed(response);
    }

    function sendErrorResponse(request, context) {
        // get user token passed in request
        const requestToken = request.directive.endpoint.scope.token;

        let responseHeader = request.directive.header;
        responseHeader.namespace = "Alexa";
        responseHeader.name = "ErrorResponse";
        responseHeader.messageId = responseHeader.messageId + "-R";

        const contextResult = {
            "properties": [{
                "namespace": "Alexa.PowerController",
                "name": "powerState",
                "value": "OFF",
                "timeOfSample": new Date().toISOString(),
                "uncertaintyInMilliseconds": 50
            }]
        };
        const response = {
            context: contextResult,
            event: {
                header: responseHeader,
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: requestToken
                    },
                    endpointId: endpointID
                },
                payload: {}
            }
        };

        console.log(`DEBUG[powerControl]: sending error (power OFF) response: ${JSON.stringify(response)}`);
        context.fail(response);
    }
};
