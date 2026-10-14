const form = document.getElementById("form-reserva");
const btn = document.getElementById("btn-enviar");
const status = document.getElementById("status-form");

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
  
        status.textContent = " Pedido enviado! Em breve entraremos em contato.";
        form.reset();
    } catch (err) {
            status.textContent = " Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.";
    } finally {
            btn.disabled = false;
    }
});