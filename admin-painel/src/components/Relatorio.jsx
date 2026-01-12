import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Relatorio() {
    const [relatorio, setRelatorio] = useState(null);
    const tokenAdmin = localStorage.getItem("adminToken");

    useEffect(() => {
        gerarRelatorio();
    }, []);

    async function gerarRelatorio() {
        try {
            const res = await axios.get("http://localhost:3000/api/adminPainel/relatorio", {
                headers: { Authorization: "Bearer " + tokenAdmin }
            });
            setRelatorio(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    if (!relatorio) return <p>Carregando relatório...</p>;

    return (
        <div className="relatorio">
            <h2>Relatório Diário</h2>
            <p>Total Dinheiro: R$ {relatorio.totalDinheiro.toFixed(2)}</p>
            <p>Total Débito: R$ {relatorio.totalDebito.toFixed(2)}</p>
            <p>Total Crédito: R$ {relatorio.totalCredito.toFixed(2)}</p>
            <p>Total PIX: R$ {relatorio.totalPix.toFixed(2)}</p>
            <p><strong>Total Geral: R$ {relatorio.totalGeral.toFixed(2)}</strong></p>
        </div>
    );
}
