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

    // Extract doctorId and newIsAvailable from the event
    const { doctorId, newIsAvailable } = JSON.parse(event.body);

    // Validate the input
    if (!doctorId || typeof newIsAvailable !== "boolean") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required fields: doctorId, newIsAvailable",
        }),
      };
    }

    // Create parameters for the DynamoDB UpdateItemCommand
    const params = {
      TableName: "DoctorsTable",
      Key: {
        doctorId: { S: doctorId },
      },
      UpdateExpression: "set isAvailable = :newStatus",
      ExpressionAttributeValues: {
        ":newStatus": { BOOL: newIsAvailable },
      },
      ReturnValues: "UPDATED_NEW",
    };

    // Update the item in the DoctorsTable
    const command = new UpdateItemCommand(params);
    const data = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Doctor availability status updated successfully",
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
