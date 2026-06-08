import type { AlbumConfig, Page, Slot } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function buildDefaultPages(config: AlbumConfig): Page[] {
  const pages: Page[] = [];
  let pageOrder = 0;

  if (config.includeCover) {
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Capa', bgColor: config.bgStyle, order: pageOrder++, isCover: true });
  }

  if (config.includeIntro) {
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Abertura', bgColor: '#0a0e18', order: pageOrder++, pageTheme: 'abertura-left' });
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Identificação', bgColor: config.bgStyle, order: pageOrder++, pageTheme: 'abertura-right' });
  }

  if (config.includeClassPage) {
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Turma Especial', bgColor: config.bgStyle, order: pageOrder++, pageTheme: 'turma-left' });
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Turma Slots', bgColor: config.bgStyle, order: pageOrder++, pageTheme: 'turma-right', isAlunosPage: true });
  }

  // Alunos
  const slotsPerPage = config.stickersPerPage;
  let alunoCount = 1;
  const numAlunosSpreads = Math.ceil(config.totalPages / 2);

  for (let s = 0; s < numAlunosSpreads; s++) {
    const leftIndex = s * 2;
    const rightIndex = s * 2 + 1;

    const startLeft = alunoCount;
    const endLeft = startLeft + slotsPerPage - 1;
    const titleLeft = config.pageNames[leftIndex] || `Alunos ${startLeft}-${endLeft}`;
    pages.push({
      id: uuidv4(), albumId: config.id, title: titleLeft, bgColor: config.bgStyle, order: pageOrder++,
      pageTheme: 'alunos-left', isAlunosPage: true, startNum: startLeft, endNum: endLeft
    });
    alunoCount += slotsPerPage;

    if (rightIndex < config.totalPages) {
      const startRight = alunoCount;
      const endRight = startRight + slotsPerPage - 1;
      const titleRight = config.pageNames[rightIndex] || `Alunos ${startRight}-${endRight}`;
      pages.push({
        id: uuidv4(), albumId: config.id, title: titleRight, bgColor: config.bgStyle, order: pageOrder++,
        pageTheme: 'alunos-right', isAlunosPage: true, startNum: startRight, endNum: endRight
      });
      alunoCount += slotsPerPage;
    }
  }

  if (config.includeLabsPage) {
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Laboratórios Especial', bgColor: '#050810', order: pageOrder++, pageTheme: 'labs-left' });
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Laboratórios Slots', bgColor: '#050810', order: pageOrder++, pageTheme: 'labs-right', isAlunosPage: true });
  }

  if (config.includeCoordPage) {
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Coordenação Especial', bgColor: '#0d0a1e', order: pageOrder++, pageTheme: 'coord-left' });
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Coordenação Slots', bgColor: '#0d0a1e', order: pageOrder++, pageTheme: 'coord-right', isAlunosPage: true });
  }

  if (config.includeEndPage) {
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Final Especial', bgColor: '#150f00', order: pageOrder++, pageTheme: 'final-left' });
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Encerramento', bgColor: '#150f00', order: pageOrder++, pageTheme: 'final-right' });
  }

  if (config.includeBackCover) {
    pages.push({ id: uuidv4(), albumId: config.id, title: 'Contracapa', bgColor: config.bgStyle, order: pageOrder, isBackCover: true });
  }

  return pages;
}

export function buildDefaultSlots(pages: Page[], config: AlbumConfig): Slot[] {
  const slots: Slot[] = [];

  pages.forEach((page) => {
    if (page.pageTheme === 'turma-right' || page.pageTheme === 'labs-right' || page.pageTheme === 'coord-right') {
      // 3 slots for these special right pages
      for (let j = 0; j < 3; j++) {
        let name = '';
        let numStr = '';
        if (page.pageTheme === 'turma-right') { name = `Turma ${j + 1}`; numStr = `T${j + 1}`; }
        else if (page.pageTheme === 'labs-right') { name = `Lab ${j + 1}`; numStr = `L${j + 1}`; }
        else if (page.pageTheme === 'coord-right') { name = `Coordenação ${j + 1}`; numStr = `C${j + 1}`; }

        slots.push({
          id: uuidv4(), pageId: page.id, stickerId: null, playerName: name, playerNumber: numStr, team: '', rarity: 'common', position: j
        });
      }
    } else if (page.isAlunosPage) {
      // Standard slots for Alunos
      const slotsCount = config.stickersPerPage;
      for (let j = 0; j < slotsCount; j++) {
        const absNum = page.startNum ? page.startNum + j : j + 1;
        const name = page.pageTheme === 'alunos-left' || page.pageTheme === 'alunos-right' ? `ALUNO ${absNum}` : `FOTO ${j + 1}`;
        const numStr = page.pageTheme === 'alunos-left' || page.pageTheme === 'alunos-right' ? String(absNum) : String(j + 1);

        slots.push({
          id: uuidv4(), pageId: page.id, stickerId: null, playerName: name, playerNumber: numStr, team: '', rarity: 'common', position: j
        });
      }
    }
  });

  return slots;
}
