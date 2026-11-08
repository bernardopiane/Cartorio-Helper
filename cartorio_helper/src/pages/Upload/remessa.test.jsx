import { describe, it, expect } from 'vitest';
import { getCodigo, getRecordData } from './index.jsx';

// Minimal stand-ins for the XML DOM nodes getRecordData reads — the real
// shapes are exactly these two methods plus nodeName, so plain objects do.
function emolumentos(attrs = {}, items = 0) {
  return {
    getAttribute: (n) => attrs[n] ?? '',
    getElementsByTagName: () => Array.from({ length: items }),
  };
}

function registro(nodeName, attrs = {}, emo = null) {
  return {
    nodeName,
    getAttribute: (n) => attrs[n] ?? '',
    getElementsByTagName: (tag) => (tag === 'Emolumentos' && emo ? [emo] : []),
  };
}

describe('getCodigo', () => {
  it('maps every registry node kind to its official código', () => {
    expect(getCodigo({ nodeName: 'RegistroNascimento' })).toBe('3001');
    expect(getCodigo({ nodeName: 'RegistroObito' })).toBe('3002');
    expect(getCodigo({ nodeName: 'RegistroCasamento' })).toBe('3004');
    expect(getCodigo({ nodeName: 'HabilitacaoCasamento' })).toBe('3003');
    expect(getCodigo({ nodeName: 'TranscricaoCasamento' })).toBe('3007');
    expect(getCodigo({ nodeName: 'CertidaoNascimento' })).toBe('3017');
    expect(getCodigo({ nodeName: 'CertidaoCasamento' })).toBe('3017');
    expect(getCodigo({ nodeName: 'CertidaoObito' })).toBe('3017');
    expect(getCodigo({ nodeName: 'CertidaoCRCNacional' })).toBe('3017CRC');
    expect(getCodigo({ nodeName: 'CertidaoHabilitacaoCasamento' })).toBe('3037');
    expect(getCodigo({ nodeName: 'CertidaoGenerica' })).toBe('8020');
    ['AverbacaoCasamento', 'AverbacaoNascimento', 'AverbacaoObito'].forEach((n) => {
      expect(getCodigo({ nodeName: n })).toBe('3012');
    });
  });

  it('hands back empty for unknown node kinds', () => {
    expect(getCodigo({ nodeName: 'RegistroImovel' })).toBe('');
  });
});

describe('getRecordData', () => {
  it('marks a chargable record as Pago and carries the fee columns', () => {
    const child = registro(
      'RegistroNascimento',
      { Selo: 'EYZA948210801', Livro: 'A-14', Folha: '182', Termo: '51694' },
      emolumentos({ ValorTotalEmolumentos: '153.41', FETJ: '3.21' }, 1)
    );
    const row = getRecordData(child, false);
    expect(row.selo).toBe('10801');
    expect(row.codigo).toBe('3001');
    expect(row.pago).toBe('X');
    expect(row.gratuito).toBe('');
    expect(row.emolumentos).toBe('153,41');
    expect(row.lei3217).toBe('3,21');
  });

  it('marks a record without emolumentos as Gratuito with empty fee columns', () => {
    const child = registro('RegistroObito', { Selo: 'XYZA94821' });
    const row = getRecordData(child, false);
    expect(row.pago).toBe('');
    expect(row.gratuito).toBe('X');
    expect(row.emolumentos).toBe('');
    expect(row.rit).toBe('X');
    expect(row.rcpn).toBe('');
  });

  it('treats TipoCobranca CC as chargable even with no item rows', () => {
    const child = registro(
      'RegistroCasamento',
      {},
      emolumentos({ TipoCobranca: 'CC', ValorTotalEmolumentos: '0.50' }, 0)
    );
    const row = getRecordData(child, false);
    expect(row.pago).toBe('X');
    expect(row.gratuito).toBe('');
    expect(row.emolumentos).toBe('0,50');
  });

  it('flags the RCPN side of a remessa and empties RIT', () => {
    const child = registro('RegistroNascimento', { Selo: 'ABC1234567890' });
    const row = getRecordData(child, true);
    expect(row.rcpn).toBe('X');
    expect(row.rit).toBe('');
  });
});
