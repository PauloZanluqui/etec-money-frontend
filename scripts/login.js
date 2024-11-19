const baseUrl = "http://localhost:3333/auth/login";
const formulario = document.getElementById("formLogin");

function saveToken(token) {
  localStorage.setItem("jwt", token); // Armazena o JWT no localStorage
}

if (formulario) {
  formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Captura os valores dos campos
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    // Cria um objeto com os dados do formulário
    const dados = {
      email: email,
      password: senha,
    };

    const resposta = await fetch(`${baseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      if (data.error) alert("Erro: " + data.error);
      else alert("Erro: " + data.message);
      return;
    }

    saveToken(data.token);
    // Redireciona para a página de transactions
    window.location.href = "/index.html";

    // Limpa os campos do formulário
    formulario.reset();
  });
} else {
  console.error("Formulário não encontrado!");
}
