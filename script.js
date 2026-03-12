const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfUYEYX8MIGIYW5hTWf2hz_j0VT7TBiZlAWkB183PuT25msmPFtizLvmD9ktXgV4aMj2e8E6IACs6U/pub?gid=0&single=true&output=csv";

const API_KEY = "AIzaSyCSlfy9UVQIci-CR40m1RzVUj8-DGmXpLg";

let knowledgeBase = [];

async function loadSheetData(){

const res = await fetch(sheetURL);
const csv = await res.text();

const rows = csv.split("\n").slice(1);

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


function findFromSheet(userMessage){

userMessage = userMessage.toLowerCase();

for(const item of knowledgeBase){

if(item.question && userMessage.includes(item.question.toLowerCase())){
return item.answer;
}

}

return null;

}


async function askGemini(question){

const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
parts:[
{ text: question }
]
}
]
})
});

const data = await response.json();

return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't find an answer.";

}


async function sendMessage(){

const input = document.getElementById("userInput");

const message = input.value.trim();

if(!message) return;

addMessage(message,"user");

input.value="";
input.focus();

let sheetAnswer = findFromSheet(message);

if(sheetAnswer){

addMessage(sheetAnswer,"bot");
return;

}

const geminiReply = await askGemini(message);

addMessage(geminiReply,"bot");

}



document.getElementById("userInput").addEventListener("keypress", function(event){

if(event.key === "Enter"){

event.preventDefault();

sendMessage();

}

});
