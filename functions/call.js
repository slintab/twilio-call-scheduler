exports.handler = async (context, event, callback) => {
  console.log(event);
  const response = new Twilio.Response();

  if (!isAuthorized(event.request, context)) {
    return callback(null, setUnauthorized(response));
  }

  const client = context.getTwilioClient();

  if (event.phoneNumber === undefined) {
    response.setBody("Phone number missing.").setStatusCode("400");

    return callback(null, response);
  }

  await client.calls.create({
    url: "http://demo.twilio.com/docs/voice.xml",
    to: event.phoneNumber,
    from: context.SOURCE_PHONE_NUMBER,
  });

  response.setBody("Call placed.").setStatusCode("201");

  return callback(null, response);
};

const isAuthorized = (request, context) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) return false;

  const [authType, credentials] = authHeader.split(" ");

  if (authType.toLowerCase() !== "basic") return false;

  const [username, password] = Buffer.from(credentials, "base64")
    .toString()
    .split(":");

  if (username !== context.AUTH_USERNAME || password !== context.AUTH_PASSWORD)
    return false;

  return true;
};

const setUnauthorized = (response) => {
  response
    .setBody("Unauthorized")
    .setStatusCode(401)
    .appendHeader("WWW-Authenticate", 'Basic realm="Authentication Required"');

  return response;
};
