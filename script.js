const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfUYEYX8MIGIYW5hTWf2hz_j0VT7TBiZlAWkB183PuT25msmPFtizLvmD9ktXgV4aMj2e8E6IACs6U/pub?gid=0&single=true&output=csv";

const API_KEY = "AIzaSyCSlfy9UVQIci-CR40m1RzVUj8-DGmXpLg";

let knowledgeBase = [];

let embeddings = [];

async function loadSheetData(){

const res = await fetch(sheetURL);

const csv = await res.text();

const parsed = Papa.parse(csv,{
header:true,
skipEmptyLines:true
});

knowledgeBase = parsed.data;

await createEmbeddings();

}

loadSheetData();



async function createEmbeddings(){

embeddings = [];

for(const row of knowledgeBase){

if(!row["User Question"]) continue;

const emb = await getEmbedding(row["User Question"]);

embeddings.push({
vector: emb,
answer: row["Bot Answer"]
});

}

}



async function getEmbedding(text){

const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${API_KEY}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
content:{
parts:[{text:text}]
}
})
});

const data = await response.json();

return data.embedding.values;

}



function cosineSimilarity(a,b){

let dot=0;
let normA=0;
let normB=0;

for(let i=0;i<a.length;i++){

dot+=a[i]*b[i];

normA+=a[i]*a[i];

normB+=b[i]*b[i];

}

return dot/(Math.sqrt(normA)*Math.sqrt(normB));

}



async function searchKnowledge(userQuestion){

const userEmbedding = await getEmbedding(userQuestion);

let bestScore = 0;
let bestAnswer = null;

for(const item of embeddings){

const score = cosineSimilarity(userEmbedding,item.vector);

if(score>bestScore){

bestScore=score;
bestAnswer=item.answer;

}

}

if(bestScore>0.80){
return bestAnswer;
}

return null;

}



function addMessage(text,sender){

const chat = document.getElementById("chat");

const div = document.createElement("div");

div.className="message "+sender;

div.innerText=text;

chat.appendChild(div);

chat.scrollTop=chat.scrollHeight;

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
parts:[{text:question}]
}
]
})
});

const data = await response.json();

return data?.candidates?.[0]?.content?.parts?.[0]?.text
|| "Sorry, I couldn't find an answer.";

}



async function sendMessage(){

const input = document.getElementById("userInput");

const message = input.value.trim();

if(!message) return;

addMessage(message,"user");

input.value="";
input.focus();



const sheetAnswer = await searchKnowledge(message);

if(sheetAnswer){

addMessage(sheetAnswer,"bot");
return;

}



const aiAnswer = await askGemini(message);

addMessage(aiAnswer,"bot");

}



document.getElementById("userInput").addEventListener("keypress",function(event){

if(event.key==="Enter"){

event.preventDefault();

sendMessage();

}

});
