/**
 * Get the código (code) for a given XML node type.
 * @param {Element} child - XML element
 * @returns {string} código
 */
export function getCodigo(child) {
  switch (child.nodeName) {
    case 'RegistroNascimento': return "3001";
    case 'RegistroObito': return "3002";
    case 'RegistroCasamento': return "3004";
    case 'CertidaoNascimento': return "3017";
    case 'CertidaoCRCNacional': return "3017CRC";
    case 'CertidaoObito': return "3017";
    case 'HabilitacaoCasamento': return "3003";
    case 'CertidaoHabilitacaoCasamento': return "3037";
    case 'CertidaoCasamento': return "3017";
    case 'TranscricaoCasamento': return "3007";
    case 'CertidaoGenerica': return "8020";
    case 'AverbacaoCasamento':
    case 'AverbacaoNascimento':
    case 'AverbacaoObito': return "3012";
    default: return '';
  }
}

/**
 * Get the protocolo (NumeroDocumento) from an XML element.
 * @param {Element} child - XML element
 * @returns {string} protocolo
 */
export function getProtocolo(child) {
  return child.getAttribute('NumeroDocumento') || '';
}

/**
 * Format a numeric string by replacing '.' with ','.
 * @param {string} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return value ? value.replace('.', ',') : '';
}

/**
 * Extract record data from an XML element.
 * @param {Element} child - XML element from Remessa
 * @param {boolean} isRCPN - whether the document is RCPN type
 * @returns {object} record data object
 */
export function getRecordData(child, isRCPN) {
  const emolumentosNode = child.getElementsByTagName('Emolumentos')[0];
  const hasEmolumentos = emolumentosNode && (
    emolumentosNode.getElementsByTagName('ItemEmolumento').length > 0 ||
    emolumentosNode.getAttribute('TipoCobranca') == "CC"
  );

  const getEmolumentoValue = (attributeName) => {
    return hasEmolumentos ? (emolumentosNode.getAttribute(attributeName) || '') : '';
  };

  return {
    selo: child.getAttribute('Selo')?.slice(-5) || '',
    codigo: getCodigo(child),
    rcpn: isRCPN ? 'X' : '',
    rit: isRCPN ? '' : 'X',
    protocolo: getProtocolo(child),
    dataEntrada: '',
    pago: hasEmolumentos ? 'X' : '',
    gratuito: hasEmolumentos ? '' : 'X',
    livro: child.getAttribute('Livro') || '',
    folha: child.getAttribute('Folha') || '',
    termo: child.getAttribute('Termo') || '',
    emolumentos: formatCurrency(getEmolumentoValue('ValorTotalEmolumentos')),
    lei3217: formatCurrency(getEmolumentoValue('FETJ')),
    lei4664: formatCurrency(getEmolumentoValue('FUNDPERJ')),
    lei111: formatCurrency(getEmolumentoValue('FUNPERJ')),
    funarpen: formatCurrency(getEmolumentoValue('FUNARPEN')),
    funpgalerj: formatCurrency(getEmolumentoValue('FUNPGALERJ')),
    funpgt: formatCurrency(getEmolumentoValue('FUNPGT')),
    fundacPguerj: formatCurrency(getEmolumentoValue('FUNDAC_PGUERJ')),
    mutua: formatCurrency(getEmolumentoValue('ValorMutua')),
    acoterj: formatCurrency(getEmolumentoValue('ValorAcoterj')),
    issqn: formatCurrency(getEmolumentoValue('ValorISS')),
    valorDistribuidor: formatCurrency(getEmolumentoValue('ValorDistribuidor')),
    seloEletronico: formatCurrency(getEmolumentoValue('ValorSeloEletronico')),
  };
}

/**
 * Parse an XML file content string and extract sorted record data.
 * @param {string} fileContent - raw XML string
 * @returns {object[]} sorted array of record data
 */
export function parseXmlContent(fileContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fileContent, 'text/xml');

  const isRCPN = doc.getElementsByTagName('CivilPessoasNaturais').length > 0;

  const remessa = doc.getElementsByTagName('Remessa')[0];
  if (!remessa) return [];

  return Array.from(remessa.children)
    .filter(child => child.hasAttribute('Selo') || child.hasAttribute('CCT'))
    .map(child => getRecordData(child, isRCPN))
    .sort((a, b) => {
      const sa = parseInt(a.selo) || 0;
      const sb = parseInt(b.selo) || 0;
      return sa - sb;
    });
}