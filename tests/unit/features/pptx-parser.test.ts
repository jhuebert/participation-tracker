import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { listSlidePaths, parseRels } from '@/features/slides/pptx-parser';

describe('listSlidePaths', () => {
  it('orders slideN.xml numerically', async () => {
    const zip = new JSZip();
    zip.file('ppt/slides/slide10.xml', '<p:sld/>');
    zip.file('ppt/slides/slide2.xml', '<p:sld/>');
    zip.file('ppt/slides/slide1.xml', '<p:sld/>');
    zip.file('ppt/slides/_rels/slide1.xml.rels', '');
    expect(listSlidePaths(zip)).toEqual([
      'ppt/slides/slide1.xml',
      'ppt/slides/slide2.xml',
      'ppt/slides/slide10.xml',
    ]);
  });
});

describe('parseRels', () => {
  it('maps rId to media filename via mediaMap', () => {
    const rels = `<?xml version="1.0"?>
      <Relationships>
        <Relationship Id="rId1" Type="http://img" Target="../media/image1.png"/>
        <Relationship Id="rId2" Type="http://other" Target="../slides/slide2.xml"/>
      </Relationships>`;
    const mediaMap = { 'image1.png': 'blob:fake' };
    expect(parseRels(rels, mediaMap)).toEqual({ rId1: 'blob:fake' });
  });
});
