const baseUrl = "http://localhost:3333";
let loadingSpinner;
let overlay;

function openModal(isEdit) {
  if(isEdit) {
    document.getElementById("Modal-Title").innerHTML = "Editar Transação";
    document.getElementById("button-save").style.display = "none";
    document.getElementById("button-edit").style.display = "block";
  }
  else {
    document.getElementById("Modal-Title").innerHTML = "Adicionar Transação"
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
  loadingSpinner = document.getElementById('loading');
  overlay = document.getElementById('overlay');
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
  overlay.style.display = 'block';
  loadingSpinner.style.display = 'block';
  const tbody = document.getElementById("table-body");

  tbody.innerHTML = "";

  await fetch(`${baseUrl}/transactions`)
  .then((response) => response.json())
  .then((data) => {
    data.transactions.forEach((transaction) => {
      if (transaction.type === "debit") {
        const newRow = `
        <tr id="${transaction.id}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-6 py-4">${transaction.id}</td>
                <th class="px-6 py-4 font-medium text-gray-900 dark:text-white">${transaction.title}</th>
                <td class="px-6 py-4 text-red-400">R$ ${transaction.amount}</td>
                <td class="px-6 py-4 text-right">
                  <a onclick="listOneTransaction(${transaction.id})" class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline pe-3">Editar</a>
                  <a onclick="deleteTransaction(${transaction.id})" class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline">Excluir</a>
                </td>
              </tr>
        `;
  
        tbody.innerHTML += newRow;
      }
      else {
        const newRow = `
        <tr id="${transaction.id}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-6 py-4">${transaction.id}</td>
                <th class="px-6 py-4 font-medium text-gray-900 dark:text-white">${transaction.title}</th>
                <td class="px-6 py-4 text-green-400">R$ ${transaction.amount}</td>
                <td class="px-6 py-4 text-right">
                  <a onclick="listOneTransaction(${transaction.id})" class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline pe-3">Editar</a>
                  <a onclick="deleteTransaction(${transaction.id})" class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline">Excluir</a>
                </td>
              </tr>
        `;
  
        tbody.innerHTML += newRow;
      }
    });
  })
  .catch((error) => console.error("Erro: " + error));
  overlay.style.display = 'none';
  loadingSpinner.style.display = 'none';
}

async function listOneTransaction(id) {
  overlay.style.display = 'block';
  loadingSpinner.style.display = 'block';
  
  await fetch(`${baseUrl}/transactions/${id}`)
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("itemId").value = data.transaction.id;
    document.getElementById("title").value = data.transaction.title;
    document.getElementById("amount").value = data.transaction.amount;
    document.getElementById("type-transaction").value = data.transaction.type;
  })
  .catch((error) => console.error("Erro: " + error));

  loadingSpinner.style.display = 'none';
  overlay.style.display = 'none';

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
  let id =  document.getElementById("itemId").value;
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
