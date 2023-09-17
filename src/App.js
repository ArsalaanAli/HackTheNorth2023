import "./App.css";
import { startGuestChat, connectWebSocket, sendGuestChat } from "./Genesys";
import { TrainingModel } from "./TrainingBot";
import { useState } from "react";

export var chat = [];

function App() {
  const [companyDesc, setCompanyDesc] = useState(
    "caters food for large parties"
  );
  const [scenario, setScenario] = useState(
    "customer is vegetarian, but they recieved meat in their food"
  );
  const [criteria, setCriteria] = useState(
    "1: Employee should not ask for any sensitive information such as credit card numbers, addresses, etc. emails and transaction IDs are ok to ask for.\n 2: Make sure the customer does not have anymore questions before you end the conversation."
  );

  const setUpBot = () => {
    chat = [
      {
        role: "system",
        content: `GPT is going to act like a customer who is talking to a customer support representitive for a company, this company ${companyDesc} and the sceneario for this conversation is ${scenario}`,
      },
      {
        role: "system",
        content: `Once the employee has solved GPT's problem, GPT is going to end the conversation and give a rating out of 10 to the employee based on how good their customer service was based this criteria: ${criteria}`,
      },
      {
        role: "assistant",
        content: "I have a problem and I need support.",
      },
      {
        role: "user",
        content:
          "Hi there I am a customer support representitive, how can I help you?",
      },
    ];
  };

  const startChat = () => {
    startGuestChat().then((res) =>
      connectWebSocket(
        res["eventStreamUri"],
        res["jwt"],
        res["id"],
        res["member"]["id"]
      ).then(async () => {
        const conversationId = res["id"];
        const messageId = res["member"]["id"];
        const jwt = res["jwt"];
        await sendGuestChat(
          jwt,
          conversationId,
          messageId,
          "Connected to training bot"
        );
        const botMessage = await TrainingModel(chat);
        await sendGuestChat(jwt, conversationId, messageId, botMessage.content);
      })
    );
  };

  return (
    <div className="App">
      <h1 className="frontTitle">Genesys AI Training Bot</h1>
      <div className="section">
        <h1>Give a description for your company:</h1>
        <span>this is a company that</span>
        <br />

        <input
          className="frontInput"
          type="text"
          value={companyDesc}
          onChange={(e) => {
            setCompanyDesc(e.target.value);
          }}
        />
        <br />
      </div>
      <div className="section">
        <h1>Set the scenario for this traning session:</h1>
        <input
          className="frontInput"
          type="text"
          value={scenario}
          onChange={(e) => {
            setScenario(e.target.value);
          }}
        />
      </div>
      <br />
      <div className="section">
        <h1>Set the criteria for a successful support agent:</h1>
        <textarea
          type="text"
          value={criteria}
          onChange={(e) => {
            setCriteria(e.target.value);
          }}
        />
        <br />
      </div>
      <button
        className="connectButton"
        onClick={() => {
          setUpBot();
          startChat();
        }}
      >
        Connect
      </button>
    </div>
  );
}

export default App;
