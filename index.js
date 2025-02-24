
let funcionarios = []; 
// A função abaixo carrega os dados do json
async function carregarDados() {
    try {
        const resposta = await fetch("output.json");
        const dados = await resposta.json();

        funcionarios = dados.data; // Agora acessamos corretamente a lista de funcionários
        popularFiltros(); 
        atualizarTabela(funcionarios); // Dados na tabela de inicio
    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);
    }
}

// Função para atualizar os setores
function atualizarSetorPorCargo() {
    const cargoSelecionado = document.getElementById("cargo-select").value;
    const setorSelect = document.getElementById("setor-select");

    // Limpar as opções atuais do setor
    setorSelect.innerHTML = "";

    // Filtra os funcionários de acordo com o cargo selecionado (se houver)
    const funcionariosFiltrados = cargoSelecionado === ""
        ? funcionarios
        : funcionarios.filter(func => func["Cargo"] === cargoSelecionado);

    // Obtém os setores únicos a partir dos funcionários filtrados
    const setores = new Set();
    funcionariosFiltrados.forEach(func => {
        setores.add(func["Setor"]);
    });

    // Cria e adiciona as opções no select de setor
    // Você pode adicionar uma opção vazia para indicar "todos" ou "selecione"
    const optionVazia = document.createElement("option");
    optionVazia.value = "";
    optionVazia.textContent = "Todos";
    setorSelect.appendChild(optionVazia);

    setores.forEach(setor => {
        const option = document.createElement("option");
        option.value = setor;
        option.textContent = setor;
        setorSelect.appendChild(option);
    });
}


// Aqui a função para preencher os selects de filtro
function popularFiltros() {
    const cargoSelect = document.getElementById("cargo-select");
    const setorSelect = document.getElementById("cargo-select").addEventListener("change", () => {
        atualizarSetorPorCargo();
    })
    const cargos = new Set();
    const setores = new Set();

    funcionarios.forEach(func => {
        cargos.add(func["Cargo"]);
        setores.add(func["Setor"]);
    });

    cargos.forEach(cargo => {
        const option = document.createElement("option");
        option.value = cargo;
        option.textContent = cargo;
        cargoSelect.appendChild(option);
    });

    setores.forEach(setor => {
        const option = document.createElement("option");
        option.value = setor;
        option.textContent = setor;
        setorSelect.appendChild(option);
    });
}

// Essa função é para filtrar os funcionários conforme a escolha do usuário
function filtrarDados() {
    const cargoSelecionado = document.getElementById("cargo-select").value;
    const setorSelecionado = document.getElementById("setor-select").value;

    let dadosFiltrados = funcionarios.filter(func => {
        return (cargoSelecionado === "" || func["Cargo"] === cargoSelecionado) &&
               (setorSelecionado === "" || func["Setor"] === setorSelecionado);
    });

    atualizarTabela(dadosFiltrados);
    calcularEstatisticas(dadosFiltrados);
}

// Aqui atualiza a tabela com os dados filtrados
function atualizarTabela(dados) {
    const tabelaHeader = document.getElementById("tabela-header");
    const tabelaBody = document.getElementById("tabela-dados");
    
    tabelaHeader.innerHTML = "";
    tabelaBody.innerHTML = "";

    // Obter colunas selecionadas pelos checkboxes
    const colunasSelecionadas = Array.from(document.querySelectorAll(".filter:checked")).map(input => input.value);

    // Criar cabeçalho da tabela
    const headerRow = document.createElement("tr");
    colunasSelecionadas.forEach(coluna => {
        const th = document.createElement("th");
        th.textContent = coluna;
        headerRow.appendChild(th);
    });
    tabelaHeader.appendChild(headerRow);

    // Preenche a tabela com os dados filtrados
    dados.forEach(func => {
      console.log(func)
        const row = document.createElement("tr");

        colunasSelecionadas.forEach(coluna => {
            const td = document.createElement("td");
            td.textContent = func.hasOwnProperty(coluna) ? func[coluna] : "-";
            row.appendChild(td);
        });

        tabelaBody.appendChild(row);
        
    });
}

// Função para converter valores numéricos corretamente
function converterParaNumero(valor) {
    if (typeof valor === "string") {
        valor = valor.trim();

        // Se o número já estiver no formato correto (sem separador de milhar), converte direto
        if (/^\d+(\.\d+)?$/.test(valor)) {
            return parseFloat(valor);
        }

        // Substitui apenas o último ponto por vírgula para preservar decimais corretos
        let partes = valor.split(",");
        let numeroCorrigido = partes[0].replace(/\./g, "") + (partes[1] ? "." + partes[1] : "");

        return parseFloat(numeroCorrigido) || 0;
    }
    return valor || 0;
}


// Função para calcular estatísticas
function calcularEstatisticas(dados) {
    if (!dados || dados.length === 0) {
        console.warn("Nenhum dado disponível para cálculo.");
        return;
    }

    const totalSetor = dados.length;

    // Convertemos os valores corretamente antes da soma
    const totalSalariosLiquidos = dados.reduce((acc, func) => acc + converterParaNumero(func["Líquido"]), 0);
    const totalProventos = dados.reduce((acc, func) => acc + converterParaNumero(func["Proventos"]), 0);
    const totalDescontos = dados.reduce((acc, func) => acc + converterParaNumero(func["Descontos"]), 0);

    // Cálculo correto das médias
    const mediaSalarial = totalSetor > 0 ? totalSalariosLiquidos / totalSetor : 0;
    const mediaProventos = totalSetor > 0 ? totalProventos / totalSetor : 0;
    const mediaDescontos = totalSetor > 0 ? totalDescontos / totalSetor : 0;

    // Encontrando maior e menor salário líquido corretamente
    const salariosLiquidos = dados.map(func => converterParaNumero(func["Líquido"]));
    const maiorSalario = Math.max(...salariosLiquidos);
    const menorSalario = Math.min(...salariosLiquidos);

    // Encontrando o funcionário com maior desconto corretamente
    const funcionarioMaiorDesconto = dados.reduce((maior, func) => 
        (converterParaNumero(func["Descontos"]) > converterParaNumero(maior?.["Descontos"] || 0) ? func : maior), null);

    // Cálculo correto da média percentual de descontos sobre proventos
    const percentualDescontoMedio = totalProventos > 0 ? (totalDescontos / totalProventos) * 100 : 0;

    // Atualizando o HTML com os valores corrigidos
    document.getElementById("total-setor").textContent = totalSetor;
    document.getElementById("num-funcionarios").textContent = totalSetor;
    document.getElementById("media-salarial").textContent = mediaSalarial.toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });

    document.getElementById("total-proventos").textContent = totalProventos.toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });
    document.getElementById("total-descontos").textContent = totalDescontos.toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });
    document.getElementById("media-proventos").textContent = mediaProventos.toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });
    document.getElementById("media-descontos").textContent = mediaDescontos.toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });
    document.getElementById("maior-salario").textContent = maiorSalario.toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });
    document.getElementById("menor-salario").textContent = menorSalario.toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });
    document.getElementById("percentual-desconto").textContent = percentualDescontoMedio.toFixed(2) + "%";

    if (funcionarioMaiorDesconto) {
        document.getElementById("funcionario-maior-desconto").textContent = `${funcionarioMaiorDesconto["Nome do funcionário"]} - ${converterParaNumero(funcionarioMaiorDesconto["Descontos"]).toLocaleString("pt-BR", {
            style: "currency", currency: "BRL"
        })}`;
    }
}


// Adicionar os eventos no HTML
document.getElementById("aplicar-filtros").addEventListener("click", filtrarDados);
document.querySelectorAll(".filter").forEach(checkbox => {
    checkbox.addEventListener("change", () => filtrarDados());
});


// Chamada inicial para carregar os dados ao abrir a página
carregarDados();
