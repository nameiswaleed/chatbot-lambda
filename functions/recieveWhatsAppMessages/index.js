// index.js

const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: "eu-north-1" });

exports.handler = async (event) => {
  try {
    // Log the event received
    console.log("Event: ", JSON.stringify(event, null, 2));

    // Extract the message details from the event
    const { From, Body, Timestamp } = event;

    // Validate the input
    if (!From || !Body || !Timestamp) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required fields: From, Body, Timestamp",
        }),
      };
    }

    // Generate a unique messageId
    const messageId = uuidv4();

    // Create parameters for the DynamoDB PutItemCommand
    const params = {
      TableName: "MessageHistoryTable",
      Item: {
        messageId: { S: messageId },
        from: { S: From },
        body: { S: Body },
        timestamp: { S: Timestamp },
      },
    };

    // Put the item into the DynamoDB table
    const command = new PutItemCommand(params);
    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Message received and stored successfully",
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
