const modal = {

    openModal() {  // abre o modal quando clica em nova transação
       
        document.querySelector('.modal-overlay').classList.add('active') // adiciona class
    },

    closeModal() { // fecha o modal quando clica em cancelar dentro do modal
        
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = { // tudo que envolve as transações

    all: Storage.get(),

    add(transaction) { // adiciona as transações

        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) { // remove as transações
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() { // soma todas entradas

        let totalIncomes = 0.00;

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {               
                totalIncomes = totalIncomes + transaction.amount;
            }
        })
        return totalIncomes;
    },

    expenses() { // soma todas saídas

        let totalExpenses = 0.0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) { 
                totalExpenses = totalExpenses + transaction.amount;
            }
        })
        return totalExpenses;
    },

    total() { // entradas - saídas

        return Transaction.incomes() + Transaction.expenses();
    }

}

const DOM = {

    transactionsContainer: document.querySelector('#dataTable tbody'), //localiza lugar onde vai ficar as transações no HTML

    addTransaction(transaction, index) { //adiciona transação
        const tr = document.createElement('tr') // cria o elemento tr (table row) no tbody da tabela

        tr.innerHTML = DOM.innerHTMLTransaction(transaction) // puxa o modelo de tr pra variavel tr
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr) // adiciona no código html
    },

    innerHTMLTransaction(transaction,index) { // adiciona no código a formatação da tabela
        const CSSclass = transaction.amount > 0 ? "income" : "expense" // troca o atributo da tag de dinheiro income (verde +) e expense (vermelho -)

        const amount = Utils.formatCurrency(transaction.amount) // formata a moeda

        const html = ` 

            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
         ` // cria o modelo html

         return html // retorna o modelo html
    },

    updateBalance() { //atualiza o balanço da conta em tempo real
        
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes()) // adiciona as entradas
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses()) // adiciona as saídas
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total()) // adiciona o total
    },

    clearTransactions() { // limpa todas transações

        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = { // utilidades

    formatCurrency(value) {  // formata o dinheiro
        const signal = Number(value) < 0 ? "-" : "" // adiciona sinal de negativo e positivo

        value = String(value).replace(/\D/g, "") // troca tudo que não for número por espaço vazio

        value = Number(value) / 100 // divide por 100 para achar os centavos

        value = value.toLocaleString("pt-BR", { // adiciona a vírgula e o R$
            style: "currency",
            currency: "BRL"
        })

        return signal + value;
    },

    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

const Form = { // formulário

    description: document.querySelector('input#description'), // localiza descrição
    amount: document.querySelector('input#amount'), // localiza valor em dinheiro
    date: document.querySelector('input#date'), // localiza data

    getValues() {
        return { // retorna os valores
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() { // valida se todos campos foram preenchidos
        const {description, amount, date} = Form.getValues()
        
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() { // formata os valores
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()


        try { // tenta validar
            Form.validateFields() // verifica se todos campos foram preenchidos
            const transaction = Form.formatValues() // cria uma variavel constante que formata os valores
            Transaction.add(transaction) // salva a transação
            Form.clearFields() // limpa os campos pra futuramente adicionar outra transação
            modal.closeModal() // fecha a tela de adicionar

        } catch(error) { // se tiver erro ele pega o erro
            alert(error.message) // mensagem de erro
        }
    }
}

const App = {

    init() { // inicializa a aplicação
        Transaction.all.forEach (DOM.addTransaction) // adiciona as transações

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() { // da reload na aplicação
        DOM.clearTransactions() //apaga todas transações

        App.init() // chama função pra adicionar todas transações de novo (para evitar duplicação)
    }
}

App.init() // começa o aplicativo
