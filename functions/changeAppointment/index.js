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

    // Extract appointmentId and newAppointmentTime from the event
    const { appointmentId, newAppointmentTime } = JSON.parse(event.body);

    // Validate the input
    if (!appointmentId || !newAppointmentTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required fields: appointmentId, newAppointmentTime",
        }),
      };
    }

    // Create parameters for the DynamoDB UpdateItemCommand
    const params = {
      TableName: "appointmentTable",
      Key: {
        appointmentId: { S: appointmentId },
      },
      UpdateExpression: "set appointmentTime = :newTime",
      ExpressionAttributeValues: {
        ":newTime": { S: newAppointmentTime },
      },
      ReturnValues: "UPDATED_NEW",
    };

    // Update the item in the appointmentTable
    const command = new UpdateItemCommand(params);
    const data = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Appointment time updated successfully",
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
