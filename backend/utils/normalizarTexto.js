function normalizarTexto(texto) {
  if (!texto) return "";

  return texto
    .toString()
    .normalize("NFD")                // remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

module.exports = normalizarTexto;
