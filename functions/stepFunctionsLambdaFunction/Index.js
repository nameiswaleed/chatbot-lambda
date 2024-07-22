const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");

const stepFunctions = new SFNClient({ region: "eu-north-1" });

const ARNs = {
  checkDoctorAvailability:
    "arn:aws:lambda:eu-north-1:975050157887:function:checkDoctorAvailability",
  setAppointment:
    "arn:aws:lambda:eu-north-1:975050157887:function:setAppointment",
  recieveWhatsAppMessages:
    "arn:aws:lambda:eu-north-1:975050157887:function:recieveWhatsAppMessages",
  deleteAppointment:
    "arn:aws:lambda:eu-north-1:975050157887:function:deleteAppointment",
  confirmAppointment:
    "arn:aws:lambda:eu-north-1:975050157887:function:confirmAppointment",
  unblockBlockDoctorAvailability:
    "arn:aws:lambda:eu-north-1:975050157887:function:unblockBlockDoctorAvailability",
  sendWhatsAppMessages:
    "arn:aws:lambda:eu-north-1:975050157887:function:sendWhatsAppMessages",
  retriveAppointment:
    "arn:aws:lambda:eu-north-1:975050157887:function:retriveAppointment",
  processIncomingMessages:
    "arn:aws:lambda:eu-north-1:975050157887:function:processIncomingMessages",
  changeAppointment:
    "arn:aws:lambda:eu-north-1:975050157887:function:changeAppointment",
};

exports.handler = async (event) => {
  const intentName = event.currentIntent.name;
  const userInput = event.inputTranscript;
  const userId = event.userId;

  let stateMachineArn;
  switch (intentName) {
    case "checkDoctorAvailability":
      stateMachineArn = ARNs.checkDoctorAvailability;
      break;
    case "setAppointment":
      stateMachineArn = ARNs.setAppointment;
      break;
    case "recieveWhatsAppMessages":
      stateMachineArn = ARNs.recieveWhatsAppMessages;
      break;
    case "deleteAppointment":
      stateMachineArn = ARNs.deleteAppointment;
      break;
    case "confirmAppointment":
      stateMachineArn = ARNs.confirmAppointment;
      break;
    case "unblockBlockDoctorAvailability":
      stateMachineArn = ARNs.unblockBlockDoctorAvailability;
      break;
    case "sendWhatsAppMessages":
      stateMachineArn = ARNs.sendWhatsAppMessages;
      break;
    case "retriveAppointment":
      stateMachineArn = ARNs.retriveAppointment;
      break;
    case "processIncomingMessages":
      stateMachineArn = ARNs.processIncomingMessages;
      break;
    case "changeAppointment":
      stateMachineArn = ARNs.changeAppointment;
      break;
    default:
      throw new Error(`Intent ${intentName} not supported.`);
  }

  const params = {
    stateMachineArn,
    input: JSON.stringify({
      Input: {
        message: userInput,
        userId,
      },
    }),
  };

  try {
    const command = new StartExecutionCommand(params);
    const result = await stepFunctions.send(command);
    console.log(`Started execution: ${result.executionArn}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Started execution for ${intentName}`,
        executionArn: result.executionArn,
      }),
      dialogAction: {
        type: "Close",
        fulfillmentState: "Fulfilled",
        message: {
          contentType: "PlainText",
          content: "Your request is being processed.",
        },
      },
    };
  } catch (error) {
    console.error(`Error starting execution: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Error starting execution for ${intentName}`,
        error: error.message,
      }),
      dialogAction: {
        type: "Close",
        fulfillmentState: "Failed",
        message: {
          contentType: "PlainText",
          content: `An error occurred: ${error.message}`,
        },
      },
    };
  }
};
