import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const chat = document.getElementById("chat");

let memoria = [];

function adicionarMensagem(texto, classe){
  const div = document.createElement("div");
  div.className = "msg " + classe;
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

const engine = new webllm.MLCEngine();

adicionarMensagem("Carregando IA...", "bot");

await engine.reload("Qwen2.5-0.5B-Instruct-q4f16_1-MLC");

adicionarMensagem("Olá! Sou o Candinho 🌿", "bot");

const dados = await fetch("./conhecimento.json");
const conhecimento = await dados.json();

window.enviar = async function(){

  const input = document.getElementById("pergunta");
  const pergunta = input.value;

  if(!pergunta) return;

  adicionarMensagem(pergunta, "user");

  memoria.push({
    role:"user",
    content: pergunta
  });

  input.value = "";

  let contexto = "";

  for(const chave in conhecimento){

    if(pergunta.toLowerCase().includes(chave)){
      contexto += conhecimento[chave] + "\n";
    }
  }

  const resposta = await engine.chat.completions.create({

    messages:[

      {
        role:"system",
        content: `
Você é Candinho 🌿

Um assistente educativo infantil brasileiro. Seu nome é homenagem ao grande pintor Cândido Portinari.

REGRAS:
- Seu nome é Candinho.
- Nunca diga que é uma inteligência artificial.
- Não use linguagem neutra.
- Não use diminutivos.
- Responda de forma simples, alegre e educativa.
- Fale como um professor infantil gentil.
- Quando houver contexto, use APENAS o contexto.
- Se não souber algo, diga:
"Ainda estou aprendendo sobre isso 🌱"

Contexto:
${contexto}
`
      },

      ...memoria
    ]

  });

  const texto = resposta.choices[0].message.content;

  adicionarMensagem(texto, "bot");

  memoria.push({
    role:"assistant",
    content:texto
  });

}
