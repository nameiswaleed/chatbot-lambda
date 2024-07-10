// index.js

const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: "eu-north-1" });

exports.handler = async (event) => {
  try {
    // Log the event received
    console.log("Event: ", JSON.stringify(event, null, 2));

    // Extract patient and appointment details from the event
    const { patientName, patientDisease, appointmentTime } = JSON.parse(
      event.body
    );

    // Validate the input
    if (!patientName || !patientDisease || !appointmentTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Missing required fields: patientName, patientDisease, appointmentTime",
        }),
      };
    }

    // Generate UUIDs for patient and appointment
    const patientId = uuidv4();
    const appointmentId = uuidv4();

    // Create parameters for the DynamoDB PutItemCommand for patientTable
    const patientParams = {
      TableName: "patientTable",
      Item: {
        patientId: { S: patientId },
        patientName: { S: patientName },
        patientDisease: { S: patientDisease },
        confirmationStatus:{B : false}
      },
    };

    // Create parameters for the DynamoDB PutItemCommand for appointmentTable
    const appointmentParams = {
      TableName: "appointmentTable",
      Item: {
        appointmentId: { S: appointmentId },
        patientId: { S: patientId },
        appointmentTime: { S: appointmentTime },
        status: { BOOL: false },
      },
    };

    // Put the item into the patientTable
    const putPatientCommand = new PutItemCommand(patientParams);
    await client.send(putPatientCommand);

    // Put the item into the appointmentTable
    const putAppointmentCommand = new PutItemCommand(appointmentParams);
    await client.send(putAppointmentCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Patient and appointment set successfully",
        patientId: patientId,
        appointmentId: appointmentId,
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
