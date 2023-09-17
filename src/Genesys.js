import { chat } from "./App";
import { TrainingModel } from "./TrainingBot";
const environment = "cac1.pure.cloud"; // Canada region
const orgId = "07d7213b-8d0e-4984-b806-5f416483b7d3"; // Organization Id
const deploymentId = "dcfdcc62-6395-48a8-a5b1-15381684ab37"; // Deployment Id - associated with the web chat location - same as deploymentKey on https://developer.dev-genesys.cloud/developer-tools/#/webchat
const queueName = "EmployeeQueue"; // The name of the queue
const displayName = "Andy"; // The display name for the guest chat conversation
const email = "jeez@cui.com"; // The associated email address for the guest
const routingTarget = {
  targetAddress: queueName,
  targetType: "QUEUE",
  priority: 2,
};
const memberInfo = {
  displayName: displayName,
  role: "CUSTOMER",
  customFields: {
    firstName: "Erik",
    lastName: "",
    addressStreet: "",
    addressCity: "",
    addressPostalCode: "",
    addressState: "",
    phoneNumber: "",
    customField1Label: "",
    customField1: "",
    customField2Label: "",
    customField2: "",
    customField3Label: "",
    customField3: "",
    _genesys_source: "web",
    _genesys_referrer: "",
    _genesys_url:
      "https://developer.dev-genesys.cloud/developer-tools/#/webchat",
    _genesys_pageTitle: "Developer Tools",
    _genesys_browser: "Chrome",
    _genesys_OS: "Mac OS X",
    email: email,
    subject: "",
  },
};
export function startGuestChat(body) {
  console.log("start guest chat");
  return fetch(
    `https://api.${environment}/api/v2/webchat/guest/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organizationId: orgId,
        deploymentId: deploymentId,
        routingTarget: routingTarget,
        memberInfo: memberInfo,
      }),
    }
  )
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .catch((e) => console.error(e));
}

export function sendGuestChat(jwt, conversationId, messageId, text) {
  console.log("send guest chat");
  console.log(arguments);
  return fetch(
    `https://api.${environment}/api/v2/webchat/guest/conversations/${conversationId}/members/${messageId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        body: text,
      }),
    }
  )
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .catch((e) => console.error(e));
}

export function connectWebSocket(
  eventStreamUri,
  jwt,
  conversationId,
  messageId
) {
  var flag = true;
  var senderId = null;
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(eventStreamUri);

    ws.onopen = (e) => {
      resolve();
    };

    ws.onmessage = async (evt) => {
      // Process the messages here

      const data = JSON.parse(evt.data);
      if (data.eventBody.sender && data.eventBody.sender.id !== senderId) {
        if (data.eventBody.body) {
          if (flag) {
            senderId = data.eventBody.sender.id;
            flag = false;
            const userMessage = data.eventBody.body;
            chat.push({
              role: "user",
              content: userMessage,
            });
          } else {
            const userMessage = data.eventBody.body;
            chat.push({
              role: "user",
              content: userMessage,
            });
            const botMessage = await TrainingModel(chat);
            await sendGuestChat(
              jwt,
              conversationId,
              messageId,
              botMessage.content
            );
          }
        }
      }
    };
  });
}
// Send guest messages
// startGuestChat().then((res) =>
//   connectWebSocket(res["eventStreamUri"]).then(async () => {
//     const conversationId = res["id"];
//     const messageId = res["member"]["id"];
//     const jwt = res["jwt"];
//     await sendGuestChat(jwt, conversationId, messageId, "Hello there!"); // Send messages here
//     await sendGuestChat(jwt, conversationId, messageId, "How are you?");
//   })
// );
