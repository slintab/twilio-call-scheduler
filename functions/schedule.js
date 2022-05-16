exports.handler = async function (context, event, callback) {
  const { EventBridgeClient } = require("@aws-sdk/client-eventbridge");

  if (event.phoneNumber === undefined) {
    return callback("Phone number missing.");
  }

  const ebClient = new EventBridgeClient({ region: context.AWS_REGION });

  try {
    const rule = await createRule(ebClient, event);
    const target = await createTarget(ebClient, context, event, rule);
  } catch (error) {
    console.log(error);
  }

  callback(null, "Call placed.");
};

const createRule = async (client, event) => {
  const { PutRuleCommand } = require("@aws-sdk/client-eventbridge");
  const callDate = new Date(event.time);
  console.log(callDate);
  const [minute, hour, day, month, year] = [
    callDate.getMinutes(),
    callDate.getHours(),
    callDate.getDate(),
    callDate.getMonth() + 1,
    callDate.getFullYear(),
  ];

  const schedule = `cron(${minute} ${hour} ${day} ${month} ? ${year})`;

  const ruleName = `${event.phoneNumber}-${callDate.getTime()}`.replace(
    "+",
    ""
  );

  const ruleParams = {
    Name: ruleName,
    ScheduleExpression: schedule,
    State: "ENABLED",
  };

  await client.send(new PutRuleCommand(ruleParams));

  return ruleName;
};

const createTarget = async (client, context, event, rule) => {
  const { PutTargetsCommand } = require("@aws-sdk/client-eventbridge");

  const targetParams = {
    Rule: rule,
    Targets: [
      {
        Arn: context.AWS_EB_API_DESTINATION,
        Id: "twilio-call-function",
        RoleArn: context.AWS_EB_API_DESTINATION_ROLE,
        HttpParameters: {
          QueryStringParameters: {
            phoneNumber: event.phoneNumber,
          },
        },
      },
    ],
  };

  return client.send(new PutTargetsCommand(targetParams));
};
