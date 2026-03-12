body{
font-family: Arial;
background:#f4f4f4;
display:flex;
justify-content:center;
margin-top:40px;
}

.chat-container{
width:420px;
background:white;
padding:20px;
border-radius:10px;
box-shadow:0 0 10px rgba(0,0,0,0.1);
}

#chat{
height:400px;
overflow-y:auto;
border:1px solid #ddd;
padding:10px;
margin-bottom:10px;
}

.message{
margin:8px 0;
}

.user{
text-align:right;
color:#007bff;
}

.bot{
text-align:left;
color:#333;
}

.input-area{
display:flex;
gap:10px;
}

input{
flex:1;
padding:8px;
}

button{
padding:8px 12px;
cursor:pointer;
}
