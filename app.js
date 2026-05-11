import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const chat = document.getElementById("chat");

let memoria = [];

function adicionarMensagem(texto, classe) {
  const div = document.createElement("div");
  div.className = "msg " + classe;
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

const engine = new webllm.MLCEngine();

async function iniciar() {

  adicionarMensagem("Carregando IA...", "bot");

  await engine.reload("Qwen2.5-0.5B-Instruct-q4f16_1-MLC");

  adicionarMensagem("Olá! Sou o Candinho 🌿", "bot");

  const arquivos = [

  "./dados/apoio_emocional.json",
  "./dados/artes_visuais.json",
  "./dados/artistas.json",
  "./dados/artistas_universais.json",
  "./dados/atividades_artisticas.json",
  "./dados/cultura_afro_brasileira.json",
  "./dados/cultura_indigena.json",
  "./dados/curiosidades.json",
  "./dados/dancas.json",
  "./dados/festas_brasileiras.json",
  "./dados/folclore.json",
  "./dados/historia_arte.json",
  "./dados/lugares_arte.json",
  "./dados/musica.json",
  "./dados/piadas.json",
  "./dados/ritmos_musicais.json",
  "./dados/teatro.json"

];

let conhecimento = {};

for (const arquivo of arquivos) {

  const resposta = await fetch(arquivo);
  const json = await resposta.json();

  conhecimento = {
    ...conhecimento,
    ...json
  };

}

  window.enviar = async function () {

    const input = document.getElementById("pergunta");
    const pergunta = input.value.trim();

    if (!pergunta) return;

    adicionarMensagem(pergunta, "user");

    memoria.push({
      role: "user",
      content: pergunta
    });

    input.value = "";

    let contexto = "";

    for (const chave in conhecimento) {

      if (pergunta.toLowerCase().includes(chave.toLowerCase())) {
        contexto += conhecimento[chave] + "\n";
      }
    }

    const resposta = await engine.chat.completions.create({

      messages: [

        {
          role: "system",
          content: `
Você é Candinho 🌿

Um assistente educativo infantil brasileiro.
Seu nome é homenagem ao grande pintor Cândido Portinari.

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
      role: "assistant",
      content: texto
    });

  };

}

iniciar();
