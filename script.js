const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfUYEYX8MIGIYW5hTWf2hz_j0VT7TBiZlAWkB183PuT25msmPFtizLvmD9ktXgV4aMj2e8E6IACs6U/pub?gid=0&single=true&output=csv";

const GEMINI_API_KEY = "AIzaSyCSlfy9UVQIci-CR40m1RzVUj8-DGmXpLg";

let knowledgeBase = [];

async function loadSheetData() {

const res = await fetch(sheetURL);
const data = await res.text();

const rows = data.split("\n").slice(1);

knowledgeBase = rows.map(row => {

const cols = row.split(",");

return {
question: cols[0],
answer: cols[1],
category: cols[2],
intent: cols[3]
};

});

}

loadSheetData();

function addMessage(text, sender){

const chat = document.getElementById("chat");

const div = document.createElement("div");

div.className = "message " + sender;

div.innerText = text;

chat.appendChild(div);

chat.scrollTop = chat.scrollHeight;

}

async function sendMessage(){

const input = document.getElementById("userInput");

const message = input.value;

if(!message) return;

addMessage(message,"user");

input.value="";

let sheetAnswer = findFromSheet(message);

if(sheetAnswer){
addMessage(sheetAnswer,"bot");
return;
}

const geminiReply = await askGemini(message);

addMessage(geminiReply,"bot");

}

function findFromSheet(userMessage){

userMessage = userMessage.toLowerCase();

for(const item of knowledgeBase){

if(userMessage.includes(item.question.toLowerCase())){
return item.answer;
}

}

return null;

}

async function askGemini(question){

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

const response = await fetch(url,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[{
parts:[{text:question}]
}]
})
});

const data = await response.json();

return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't answer.";

}
