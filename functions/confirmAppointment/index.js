// index.js

const {
  DynamoDBClient,
  UpdateItemCommand,
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

    // Create parameters for the DynamoDB UpdateItemCommand
    const params = {
      TableName: "appointmentTable",
      Key: {
        appointmentId: { S: appointmentId },
      },
      UpdateExpression: "set confirmationStatus = :status",
      ExpressionAttributeValues: {
        ":status": { BOOL: true },
      },
      ReturnValues: "UPDATED_NEW",
    };

    // Update the item in the appointmentTable
    const command = new UpdateItemCommand(params);
    const data = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Appointment updated successfully",
        updatedAttributes: data.Attributes,
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
