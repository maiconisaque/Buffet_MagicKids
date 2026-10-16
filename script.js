(function () {
    // === EDITE AQUI: datas já reservadas (formato AAAA-MM-DD) ===
    const DATAS_OCUPADAS = ["2026-11-14", "2026-11-21", "2026-12-05"];

    const calEl = document.getElementById("calendario");
    const inputData = document.getElementById("data_festa");
    const formReserva = document.getElementById("form-reserva");
    if (!calEl || !formReserva) return;

    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    let selecionada = null;

    const pad = (n) => String(n).padStart(2, "0");
    const toIso = (a, m, d) => `${a}-${pad(m + 1)}-${pad(d)}`;

    function desenhar() {
        const ano = mesAtual.getFullYear();
        const mes = mesAtual.getMonth();
        const primeiroDia = new Date(ano, mes, 1).getDay();
        const totalDias = new Date(ano, mes + 1, 0).getDate();
        const mesDeHoje = ano === hoje.getFullYear() && mes === hoje.getMonth();

        let html = `
            <div class="cal-topo">
                <button type="button" data-nav="-1" ${mesDeHoje ? "disabled" : ""} aria-label="Mês anterior">‹</button>
                <span>${meses[mes]} ${ano}</span>
                <button type="button" data-nav="1" aria-label="Próximo mês">›</button>
            </div>
            <div class="cal-grade">`;

        ["D","S","T","Q","Q","S","S"].forEach((s) => (html += `<span class="cal-semana">${s}</span>`));
        for (let i = 0; i < primeiroDia; i++) html += "<span></span>";

        for (let d = 1; d <= totalDias; d++) {
            const iso = toIso(ano, mes, d);
            const passado = new Date(ano, mes, d) < hoje;
            const ocupado = DATAS_OCUPADAS.includes(iso);
            let classes = "cal-dia";
            if (ocupado) classes += " ocupado";
            if (iso === selecionada) classes += " selecionado";
            html += `<button type="button" class="${classes}" data-data="${iso}" ${passado || ocupado ? "disabled" : ""}>${d}</button>`;
        }

        calEl.innerHTML = html + "</div>";
    }

    calEl.addEventListener("click", (e) => {
        const nav = e.target.closest("[data-nav]");
        if (nav) {
            mesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + Number(nav.dataset.nav), 1);
            desenhar();
            return;
        }
        const dia = e.target.closest(".cal-dia");
        if (dia && !dia.disabled) {
            selecionada = dia.dataset.data;
            const [a, m, d] = selecionada.split("-");
            inputData.value = `${d}/${m}/${a}`;
            desenhar();
        }
    });

    // Impede o envio se nenhuma data foi escolhida
    formReserva.addEventListener("submit", (e) => {
        if (!selecionada) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const msg = document.getElementById("status-form");
            if (msg) msg.textContent = "Escolha a data da festa no calendário.";
        }
    }, true);

    // Limpa a seleção quando o formulário é resetado (após o envio)
    formReserva.addEventListener("reset", () => {
        selecionada = null;
        desenhar();
    });

    desenhar();
})();

const form = document.getElementById("form-reserva");
const btn = document.getElementById("btn-enviar");
const status = document.getElementById("status-form");

if (form && btn && status) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        btn.disabled = true;
        status.textContent = "Enviando...";

        try {
            const dados = Object.fromEntries(new FormData(form));
            const resp = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(dados)
            });
            const resultado = await resp.json();

            if (!resp.ok || !resultado.success) throw new Error();

            status.textContent = "Pedido enviado! Em breve entraremos em contato.";
            form.reset();
        } catch (err) {
            status.textContent = "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.";
        } finally {
            btn.disabled = false;
        }
    });
}

const botao = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

if (botao && menu) {
    botao.addEventListener('click', function () {
        const aberto = menu.classList.toggle('aberto');
        botao.classList.toggle('aberto', aberto);
        botao.setAttribute('aria-expanded', aberto);
        botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
}
(async function () {
    // Só roda nas páginas que têm o painel (contato.html)
    if (!document.getElementById("adm-raiz")) return;
 
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getFirestore, doc, getDoc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    const { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
 
    // 1) Cole aqui os dados do seu projeto Firebase (são públicos; a proteção está nas Regras do Firestore)
    const firebaseConfig = {
        apiKey: "COLE_AQUI",
        authDomain: "COLE_AQUI",
        projectId: "COLE_AQUI",
        appId: "COLE_AQUI"
    };
 
    // 2) Textos que o painel pode editar.
    //    "alvos" são os lugares da página onde o texto aparece (seletores CSS).
    const CAMPOS = [
        { chave: "titulo_contato", rotulo: "Título da página",         tipo: "texto", alvos: [".contato > h2"] },
        { chave: "intro_contato",  rotulo: "Texto de introdução",      tipo: "longo", alvos: [".contato-intro"] },
        { chave: "whatsapp",       rotulo: "WhatsApp",                 tipo: "texto", alvos: [".contato-info li:nth-child(1)", ".rodape-col:nth-child(2) li:nth-child(1)"] },
        { chave: "instagram",      rotulo: "Instagram",                tipo: "texto", alvos: [".contato-info li:nth-child(2)"] },
        { chave: "endereco",       rotulo: "Endereço",                 tipo: "longo", alvos: [".contato-info li:nth-child(3)"] },
        { chave: "horario",        rotulo: "Horário de funcionamento", tipo: "texto", alvos: [".contato-info li:nth-child(4)", ".rodape-col:nth-child(2) li:nth-child(3)"] }
    ];
 
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
 
    const $ = (id) => document.getElementById(id);
    const raiz = $("adm-raiz");
 
    let conteudo = {};
    let datas = [];
    const original = {};
    let adminIniciado = false;
 
    /* ---------- Localiza os elementos de cada campo ---------- */
    // Se o elemento tem um rótulo (<span>) e depois um texto solto, embrulha só o texto
    function resolverAlvo(el) {
        if (!el) return null;
        if (el.children.length === 0) return el;
        const textos = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
        const no = textos[textos.length - 1];
        if (!no) return null;
        const marca = document.createElement("i");
        marca.style.fontStyle = "normal";
        marca.dataset.espaco = "1";
        marca.textContent = no.textContent;
        el.replaceChild(marca, no);
        return marca;
    }
 
    CAMPOS.forEach((c) => {
        c.els = c.alvos.map((s) => resolverAlvo(document.querySelector(s))).filter(Boolean);
        original[c.chave] = c.els.length ? c.els[0].textContent.trim() : "";
    });
 
    function aplicar(dados) {
        CAMPOS.forEach((c) => {
            const v = dados[c.chave];
            if (!v) return;
            c.els.forEach((el) => (el.textContent = (el.dataset.espaco ? " " : "") + v));
        });
    }
 
    function avisarAgenda() {
        window.dispatchEvent(new CustomEvent("agenda-carregada", { detail: [...datas] }));
    }
 
    /* ---------- Carrega o conteúdo salvo (para todos os visitantes) ---------- */
    async function carregarPublico() {
        try {
            const [c, a] = await Promise.all([
                getDoc(doc(db, "site", "conteudo")),
                getDoc(doc(db, "site", "agenda"))
            ]);
            conteudo = c.exists() ? c.data() : {};
            datas = a.exists() ? (a.data().datasOcupadas || []) : [];
            aplicar(conteudo);
            avisarAgenda();
        } catch (erro) {
            console.error("Não foi possível carregar o conteúdo do painel:", erro);
        }
    }
 
    /* ---------- Painel ---------- */
    function avisar(msg, ok = true) {
        const el = $("adm-aviso");
        el.textContent = msg;
        el.className = ok ? "adm-ok" : "adm-erro";
    }
 
    function montarCampos() {
        const box = $("adm-campos");
        box.innerHTML = "";
        CAMPOS.forEach((c) => {
            const label = document.createElement("label");
            label.textContent = c.rotulo;
            const campo = document.createElement(c.tipo === "longo" ? "textarea" : "input");
            campo.id = "adm-" + c.chave;
            campo.value = conteudo[c.chave] || original[c.chave] || "";
            label.appendChild(campo);
            box.appendChild(label);
        });
    }
 
    function desenharDatas() {
        const ul = $("adm-datas");
        ul.innerHTML = "";
        [...datas].sort().forEach((d) => {
            const [a, m, dia] = d.split("-");
            const li = document.createElement("li");
            li.textContent = dia + "/" + m + "/" + a;
            const b = document.createElement("button");
            b.type = "button";
            b.className = "sec";
            b.textContent = "Remover";
            b.onclick = async () => {
                datas = datas.filter((x) => x !== d);
                desenharDatas();
                await salvarDatas();
            };
            li.appendChild(b);
            ul.appendChild(li);
        });
    }
 
    async function salvarDatas() {
        try {
            await setDoc(doc(db, "site", "agenda"), { datasOcupadas: datas });
            avisarAgenda();
            avisar("Datas salvas! O calendário já foi atualizado.");
        } catch (e) {
            console.error(e);
            avisar("Erro ao salvar as datas.", false);
        }
    }
 
    function fecharAdmin() {
        raiz.hidden = true;
        history.replaceState(null, "", location.pathname + location.search);
    }
 
    const carregado = carregarPublico();
 
    function configurarAdmin() {
        $("adm-fechar").onclick = fecharAdmin;
        $("adm-sair").onclick = () => signOut(auth);
 
        $("adm-login").addEventListener("submit", async (e) => {
            e.preventDefault();
            $("adm-erro").textContent = "";
            try {
                await signInWithEmailAndPassword(auth, $("adm-email").value, $("adm-senha").value);
            } catch (err) {
                $("adm-erro").textContent = "E-mail ou senha incorretos.";
            }
        });
 
        $("adm-salvar").onclick = async () => {
            const dados = {};
            CAMPOS.forEach((c) => (dados[c.chave] = $("adm-" + c.chave).value.trim()));
            try {
                await setDoc(doc(db, "site", "conteudo"), dados, { merge: true });
                conteudo = { ...conteudo, ...dados };
                aplicar(conteudo);
                avisar("Salvo! O site já está atualizado.");
            } catch (e) {
                console.error(e);
                avisar("Erro ao salvar os textos.", false);
            }
        };
 
        $("adm-add").onclick = async () => {
            const v = $("adm-nova-data").value;
            if (!v || datas.includes(v)) return;
            datas.push(v);
            $("adm-nova-data").value = "";
            desenharDatas();
            await salvarDatas();
        };
 
        onAuthStateChanged(auth, async (user) => {
            $("adm-login").hidden = !!user;
            $("adm-painel").hidden = !user;
            if (user) {
                await carregado;
                montarCampos();
                desenharDatas();
            }
        });
    }
 
    function abrirAdmin() {
        if (!raiz) return;
        if (!adminIniciado) {
            adminIniciado = true;
            configurarAdmin();
        }
        raiz.hidden = false;
    }
 
    // O painel só abre em contato.html#admin
    if (location.hash === "#admin") abrirAdmin();
    window.addEventListener("hashchange", () => { if (location.hash === "#admin") abrirAdmin(); });
})().catch((e) => console.error("Painel admin:", e));