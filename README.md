# Twilio Call Scheduler

This is an example implementation of a call scheduler (think [click-to-call](https://github.com/TwilioDevEd/clicktocall-node) at a set date and time) using [Twilio Programmable Voice](https://www.twilio.com/docs/voice), [Twilio Functions](https://www.twilio.com/docs/runtime/functions) and [AWS EventBridge](https://aws.amazon.com/eventbridge/).

## Setup

The easiest way to deploy this application is by using the [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit).

1. Create an AWS EventBridge API destination following the steps [here](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-api-destinations.html).
    - When creating the connection, for **Authorization type** select *Basic* and any username and password.
    - For **API destination endpoint**, enter some dummy value. We will update it after our functions have been deployed.
    - For **HTTP method**, enter *POST*.
2. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
3. Install the [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)
4. Create a `.env` file with the following environment variables: 
    - `ACCOUNT_SID` - Twilio account sid
    - `AUTH_TOKEN` - Twilio auth token 
    - `SOURCE_PHONE_NUMBER` - Phone number to use for initating the calls
    - `AWS_ACCESS_KEY_ID` - AWS access key id
    - `AWS_SECRET_ACCESS_KEY` - AWS secret access key
    - `AWS_REGION` - AWS region of your EventBridge bus
    - `AUTH_USERNAME` - Basic auth username to use for securing the caller function from step 1 (connection)
    - `AUTH_PASSWORD` - Basic auth password to use for securing the caller function from step 1 (connection)
    - `AWS_EB_API_DESTINATION` - AWS EventBridge API destination ARN
    - `AWS_EB_API_DESTINATION_ROLE` - AWS EventBridge API destination role ARN
5. Deploy functions using the `twilio serverless:deploy` command.
6. Update the API Destination Endpoint to the path of the `/call` function that was just deployed (should be visible in the terminal following the completion of the deploy command; it can also be found in your Twilio Console, under Functions).
7. Navigate to `/index.html` to see your scheduler!


## Architecture
![Architecture Diagram](./architecture.png?raw=true)

This solution has three main components:
 - **/schedule function**: creates an EventBridge rule, with a schedule expression based on the user's input and an EventBridge target, linking the API destination (the `/call` function) to the newly created EventBridge rule. As a result, the `/call` function is invoked at the time and date chosen by the user by EventBridge. Note: each scheduling creates an EventBridge rule, which runs only once (at the scheduled time and date). Afterwards these rules can be deleted.
 - **/call Function**: makes a call to the phone number received as its input.
 - **AWS EventBridge**: invokes the `/call` function at the desired time. 


## Demo
![Demo screenshot](./demo.png?raw=true)


## Maintainer
Thanks for reading this far!
If you have any questions, do not hesitate to reach out at `hello@slintab.dev`