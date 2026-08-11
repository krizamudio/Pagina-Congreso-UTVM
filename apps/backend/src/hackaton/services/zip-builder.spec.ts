import { buildZip } from './zip-builder';

describe('buildZip', () => {
  it('crea un ZIP con una entrada por destinatario', () => {
    const zip = buildZip([
      { name: 'ana.pdf', data: Buffer.from('%PDF-ana') },
      { name: 'luis.pdf', data: Buffer.from('%PDF-luis') },
    ]);
    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    expect(zip.toString('utf8')).toContain('ana.pdf');
    expect(zip.toString('utf8')).toContain('luis.pdf');
    expect(zip.readUInt16LE(zip.length - 14)).toBe(2);
  });
});
