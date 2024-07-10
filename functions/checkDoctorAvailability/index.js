// index.js

const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: "eu-north-1" });

exports.handler = async (event) => {
  try {
    // Log the event received
    console.log("Event: ", JSON.stringify(event, null, 2));

    // Create parameters for the DynamoDB ScanCommand
    const params = {
      TableName: "DoctorsTable",
      FilterExpression: "isAvailable = :true",
      ExpressionAttributeValues: {
        ":true": { BOOL: true },
      },
    };

    // Scan the DoctorsTable for available doctors
    const command = new ScanCommand(params);
    const data = await client.send(command);

    // Unmarshall the DynamoDB response items
    const availableDoctors = data.Items.map((item) => unmarshall(item));

    return {
      statusCode: 200,
      body: JSON.stringify(availableDoctors),
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
