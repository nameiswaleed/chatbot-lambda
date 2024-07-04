// index.js

const {
  DynamoDBClient,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: "eu-north-1" });

exports.handler = async (event) => {
  try {
    // Log the event received
    console.log("Event: ", JSON.stringify(event, null, 2));

    // Extract appointmentId from the event
    const { appointmentId } = JSON.parse(event.body);

    // Validate the input
    if (!appointmentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required field: appointmentId",
        }),
      };
    }

    // Create parameters for the DynamoDB DeleteItemCommand
    const params = {
      TableName: "appointmentTable",
      Key: {
        appointmentId: { S: appointmentId },
      },
    };

    // Delete the item from the appointmentTable
    const command = new DeleteItemCommand(params);
    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Appointment deleted successfully",
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
