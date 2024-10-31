const baseUrl = "http://localhost:3333";
let loadingSpinner;
let overlay;

const params = new URLSearchParams({
  order: "asc",
});

function openModal(isEdit) {
  if (isEdit) {
    document.getElementById("Modal-Title").innerHTML = "Editar Transação";
    document.getElementById("button-save").style.display = "none";
    document.getElementById("button-edit").style.display = "block";
  } else {
    document.getElementById("Modal-Title").innerHTML = "Adicionar Transação";
    document.getElementById("button-save").style.display = "block";
    document.getElementById("button-edit").style.display = "none";
  }

  document.getElementById("modal").showModal();
}

function closeModal() {
  document.getElementById("modal").close();
  clearFields();
}

document.addEventListener("DOMContentLoaded", async function () {
  loadingSpinner = document.getElementById("loading");
  overlay = document.getElementById("overlay");

  tableSearch();

  await refreshInformations();
});

async function refreshInformations() {
  await getSummary();
  await listTransactions();
}

async function getSummary() {
  await fetch(`${baseUrl}/transactions/summary`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("total-income").textContent = `R$ ${data.summary.totalCredit}`;
      document.getElementById("total-expense").textContent = `R$ ${data.summary.totalDebit}`;
      document.getElementById("balance").textContent = `R$ ${data.summary.netBalance}`;
    });
}

function clearFields() {
  document.getElementById("itemId").value = "";
  document.getElementById("title").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("type-transaction").value = "credit";
}

async function listTransactions() {
  overlay.style.display = "block";
  loadingSpinner.style.display = "block";
  const tbody = document.getElementById("table-body");

  tbody.innerHTML = "";

  await fetch(`${baseUrl}/transactions?${params.toString()}`)
    .then((response) => response.json())
    .then((data) => {
      data.transactions.forEach((transaction) => {
        const dateObj = new Date(transaction.createdAt);

        const formattedDate = dateObj.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        if (transaction.type === "debit") {
          const newRow = `
        <tr id="${transaction.id}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-6 py-4">${transaction.id}</td>
                <th class="px-6 py-4 font-medium text-gray-900 dark:text-white">${transaction.title}</th>
                <td class="px-6 py-4 text-red-400">R$ ${transaction.amount}</td>
                <td class="px-6 py-4">${formattedDate}</td>
                <td class="px-6 py-4 text-right">
                  <a onclick="listOneTransaction(${transaction.id})" class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline pe-3">Editar</a>
                  <a onclick="deleteTransaction(${transaction.id})" class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline">Excluir</a>
                </td>
              </tr>
        `;

          tbody.innerHTML += newRow;
        } else {
          const newRow = `
        <tr id="${transaction.id}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-6 py-4">${transaction.id}</td>
                <th class="px-6 py-4 font-medium text-gray-900 dark:text-white">${transaction.title}</th>
                <td class="px-6 py-4 text-green-400">R$ ${transaction.amount}</td>
                <td class="px-6 py-4">${formattedDate}</td>
                <td class="px-6 py-4 text-right">
                  <a onclick="listOneTransaction(${transaction.id})" class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline pe-3">Editar</a>
                  <a onclick="deleteTransaction(${transaction.id})" class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline">Excluir</a>
                </td>
              </tr>
        `;

          tbody.innerHTML += newRow;
        }
      });

      renderPagination(data.page, data.totalPages);
    })
    .catch((error) => console.error("Erro: " + error));
  overlay.style.display = "none";
  loadingSpinner.style.display = "none";
}

async function listOneTransaction(id) {
  overlay.style.display = "block";
  loadingSpinner.style.display = "block";

  await fetch(`${baseUrl}/transactions/${id}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("itemId").value = data.transaction.id;
      document.getElementById("title").value = data.transaction.title;
      document.getElementById("amount").value = data.transaction.amount;
      document.getElementById("type-transaction").value = data.transaction.type;
    })
    .catch((error) => console.error("Erro: " + error));

  loadingSpinner.style.display = "none";
  overlay.style.display = "none";

  openModal(true);
}

async function saveTransaction() {
  let transaction = {
    title: document.getElementById("title").value,
    amount: Number(document.getElementById("amount").value),
    type: document.getElementById("type-transaction").value,
  };

  await fetch(`${baseUrl}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  })
    .then(closeModal())
    .catch((error) => console.error("Erro: " + error));

  await refreshInformations();

  clearFields();
}

async function editTransaction() {
  let id = document.getElementById("itemId").value;
  let transaction = {
    title: document.getElementById("title").value,
    amount: Number(document.getElementById("amount").value),
    type: document.getElementById("type-transaction").value,
  };

  await fetch(`${baseUrl}/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  })
    .then(closeModal())
    .catch((error) => console.error("Erro: " + error));

  await refreshInformations();

  clearFields();
}

async function deleteTransaction(id) {
  await fetch(`${baseUrl}/transactions/${id}`, {
    method: "DELETE",
  })
    .then(closeModal())
    .catch((error) => console.error("Erro: " + error));

  await refreshInformations();
}

// Função para renderizar a paginação com estilo específico
function renderPagination(currentPage, totalPages) {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = "";

  // Botão "Anterior"
  const prevLi = document.createElement("li");
  const prevButton = document.createElement("a");
  prevButton.innerHTML = "<";
  prevButton.className = "flex items-center justify-center px-3 h-8 ms-0 text-gray-400 bg-gray-800 border border-gray-700 rounded-s-lg cursor-pointer hover:bg-gray-700 hover:text-white";
  prevButton.onclick = (event) => {
    event.preventDefault();
    if (currentPage > 1) {
      params.set("page", currentPage - 1);
      refreshInformations();
    }
  };
  if (currentPage === 1) prevButton.classList.add("opacity-50", "pointer-events-none");
  prevLi.appendChild(prevButton);
  paginationDiv.appendChild(prevLi);

  // Botões das páginas
  for (let i = 1; i <= totalPages; i++) {
    const pageLi = document.createElement("li");
    const pageButton = document.createElement("a");
    pageButton.textContent = i;
    pageButton.className = `flex items-center justify-center px-3 h-8 ${i === currentPage ? "text-white bg-gray-700" : "text-gray-400 bg-gray-800 hover:bg-gray-700 cursor-pointer hover:text-white"} border border-gray-700`;
    pageButton.onclick = (event) => {
      event.preventDefault();
      params.set("page", i);
      refreshInformations();
    };
    pageLi.appendChild(pageButton);
    paginationDiv.appendChild(pageLi);
  }

  // Botão "Próximo"
  const nextLi = document.createElement("li");
  const nextButton = document.createElement("a");
  nextButton.innerHTML = ">";
  nextButton.className = "flex items-center justify-center px-3 h-8 text-gray-400 bg-gray-800 border border-gray-700 rounded-e-lg cursor-pointer hover:bg-gray-700 hover:text-white";
  nextButton.onclick = (event) => {
    event.preventDefault();
    if (currentPage < totalPages) {
      params.set("page", currentPage + 1);
      refreshInformations();
    }
  };
  if (currentPage === totalPages) nextButton.classList.add("opacity-50", "pointer-events-none");
  nextLi.appendChild(nextButton);
  paginationDiv.appendChild(nextLi);
}

function applyFilter(filterType) {
  toggleDropdown();
  if (filterType !== "all") {
    params.set("type", filterType);
  } else {
    params.delete("type");
  }
  refreshInformations();
}

function toggleDropdown() {
  document.getElementById("dropdown").classList.toggle("hidden");
}

window.onclick = function (event) {
  if (!event.target.matches(".inline-flex")) {
    const dropdown = document.getElementById("dropdown");
    if (!dropdown.classList.contains("hidden")) {
      dropdown.classList.add("hidden");
    }
  }
};
function tableSearch() {
  document.getElementById("table-search").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const title = event.target.value.trim();

      if (title !== "") {
        params.set("title", title);
      } else {
        params.delete("title");
      }
      refreshInformations();
    } else if (event.key === "Backspace" && event.target.value == "") {
      params.delete("title");
      refreshInformations();
    }
  });
}
