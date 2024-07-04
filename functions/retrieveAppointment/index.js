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
      TableName: "appointmentTable",
    };

    // Scan the appointmentTable to retrieve all items
    const command = new ScanCommand(params);
    const data = await client.send(command);

    // Convert DynamoDB JSON to regular JSON
    const appointments = data.Items.map((item) => unmarshall(item));

    // Return the retrieved items
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Appointments retrieved successfully",
        appointments: appointments,
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
