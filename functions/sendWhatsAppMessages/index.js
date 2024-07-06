// index.js

const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");
const twilio = require("twilio");

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: "eu-north-1" });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.handler = async (event) => {
  try {
    // Log the event received
    console.log("Event: ", JSON.stringify(event, null, 2));

    // Extract the message details from the event
    const { to, body } = JSON.parse(event.body);

    // Validate the input
    if (!to || !body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required fields: to, body",
        }),
      };
    }

    // Send the message via Twilio
    const message = await twilioClient.messages.create({
      from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
      body: body,
    });

    // Generate a unique messageId
    const messageId = uuidv4();

    // Create parameters for the DynamoDB PutItemCommand
    const params = {
      TableName: "MessageHistoryTable",
      Item: {
        messageId: { S: messageId },
        to: { S: to },
        body: { S: body },
        timestamp: { S: new Date().toISOString() },
        twilioMessageId: { S: message.sid },
      },
    };

    // Put the item into the DynamoDB table
    const command = new PutItemCommand(params);
    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Message sent and stored successfully",
        messageId: messageId,
      }),
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
