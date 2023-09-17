import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI,
  dangerouslyAllowBrowser: true,
});

export const TrainingModel = async (chatMessages) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: chatMessages,
  });
  const newMessage = response.choices[0].message;
  chatMessages.push(newMessage);
  return newMessage;
  //   const inputMessage = { role: "user", content: input };
  //   chatMessages.push(inputMessage);
};
// const companyDesc =
//   "handles online payments for a variety of third party websites";
// const currentScenario =
//   "customer gets angry because they were overcharged on their latest transaction";
// const criteria =
//   "1: Employee should not ask for any sensitive information such as credit card numbers, addresses, etc. emails and transaction IDs are ok to ask for. 2: Make sure the customer does not have anymore questions before you end the conversation.";
//yes i can help, what was your transaction id
