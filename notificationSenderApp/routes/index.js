var express = require("express");
var router = express.Router();
const { ServiceBusClient } = require("@azure/service-bus");
const azure = require("azure-sb");

/* GET home page. */
router.get("/", function (req, res, next) {
  //notificationHubService();
  res.render("index", {
    title: "Josh Push Notification",
    hubService: serviceBusClient,
  });
});

router.post("/checkMessages", async function (req, res) {
  await checkForMessages().then((result) => {
    //console.log("messages:: ");
    //console.log(result);

    res.json({ message: "idk" });
  });
});

router.post("/processMessage", function (req, res) {
  //call checkForMessagesBelow

  res.json({ message: "Process Successfull" });
});

router.post("/sendTestMessage", async function (req, res) {
  //call checkForMessagesBelow
  await sendTestMessage().then((result) => {
    res.json({ message: result });
  });
});

module.exports = router;

//Azure Function code
const queueName = "rx-queue001";
const hubname = "rx-reminders-notificationhub";
const connStr =
  "Endpoint=sb://albertsons-sb-01.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=h1X+x+Zg/N8eTsBpVUwV3q8t+GkZh9tB6U4VWSf9nPY=";

const connStrTwo =
  "Endpoint=sb://albert-proto-notification-hub.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=FVMiLeS/BIwM65cFYj+rvEKtl18sAHDHbu2RxNrzXl8=";

const notificationHubService = azure.createNotificationHubService(
  hubname,
  connStrTwo
);

const notificationHubSB = azure.createServiceBusService(connStrTwo);

if (!connStr) throw new Error("Must provide connection string");

console.log("Connecting to " + connStr + " queue " + queueName);
const serviceBusClient = new ServiceBusClient(connStr);
const serviceBusClientTwo = new ServiceBusClient(connStrTwo);
console.log("Success creating SB client");

const message = {
  body: "The body is very cool",
  subject: "This is a random subject",
};

// sending a single message, these both are fine
function sendTestMessage() {
  try {
    return new Promise((resolve) => {
      //Send this to notification hub service
      notificationHubService.send(null, message, function (error) {
        if (!error) {
          //notification sent
          console.log("sent to notification hub");
        } else {
          console.log("errr");
        }
      });

      const sender = serviceBusClient.createSender(queueName);
      //Send this to service bus queue
      sender.sendMessages(message).then((error) => {
        if (!error) {
          //notification sent
          sender.close();
          console.log("sent to service bus");
          resolve(`Success sending message: ${JSON.stringify(message)}`);
        } else {
          sender.close();
          resolve("Errors occured: ", error);
        }
      });
    });
  } catch (x) {
    console.log("error: ", x);
  } finally {
  }
}

function checkForMessages() {
  try {
    //Get from notification hub queue?
    notificationHubService.receiverTwo
      .receiveMessages(10)
      .then((allMessagesOne) => {
        console.log("IDKKKKKKK");
        console.log(allMessagesOne);

        //resolve(allMessages);
      });

    //Get from service bus queue
    const receiver = serviceBusClient.createReceiver(queueName);
    return new Promise((resolve) => {
      receiver.receiveMessages(10).then((allMessages) => {
        resolve("idk");
        //resolve(allMessages);
      });
    });
  } catch (x) {
    console.log("error: ", x);
  }

  // serviceBusClient.receiveQueueMessage(
  //   queueName,
  //   { isPeekLock: true },
  //   function (err, lockedMessage) {
  //     if (err) {
  //       if (err == "No messages to receive") {
  //         console.log("No messages");
  //       } else {
  //         callback(err);
  //       }
  //     } else {
  //       callback(null, lockedMessage);
  //     }
  //   }
  // );
}

function processMessage(serviceBusClient, err, lockedMsg) {
  if (err) {
    console.log("Error on Rx: ", err);
  } else {
    console.log("Rx: ", lockedMsg);
    serviceBusClient.deleteMessage(lockedMsg, function (err2) {
      if (err2) {
        console.log("Failed to delete message: ", err2);
      } else {
        console.log("Deleted message.");
      }
    });
  }
}

var idx = 0;
function sendMessages(serviceBusClient, queueName) {
  var msg = "Message # " + ++idx;
  serviceBusClient.sendQueueMessage(queueName, msg, function (err) {
    if (err) {
      console.log("Failed Tx: ", err);
    } else {
      console.log("Sent " + msg);
    }
  });
}

// var serviceBusClient = azure.createServiceBusService(connStr);
// serviceBusClient.createQueueIfNotExists(queueName, function (err) {
//   if (err) {
//     console.log("err: ", err);
//   } else {
//     setInterval(
//       checkForMessages.bind(
//         null,
//         serviceBusClient,
//         queueName,
//         processMessage.bind(null, serviceBusClient)
//       ),
//       5000
//     );
//     setInterval(sendMessages.bind(null, serviceBusClient, queueName), 15000);
//   }
// });
