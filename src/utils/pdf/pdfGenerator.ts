import jsPDF from 'jspdf';
import { Checklist } from '@/types';
import { getUserLogo } from './userHelpers';
import { addHeader, addBasicInfo, addInspectionItems, addPhotosSection, addObservations, addSignature } from './pdfSections';

// Função principal para gerar PDF - força download
export const generatePDF = async (checklistData: Checklist, userId?: string) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;
  const margin = 20;

  // Buscar logo do usuário
  const userLogo = await getUserLogo(userId);

  // Header com logo personalizada
  yPos = await addHeader(pdf, userLogo, yPos, margin);

  // Basic Information
  yPos = addBasicInfo(pdf, checklistData, yPos, margin, pageWidth);

  // Inspection Items
  yPos = addInspectionItems(pdf, checklistData, yPos, margin, pageWidth, pageHeight);

  // Photos section
  yPos = await addPhotosSection(pdf, checklistData, yPos, margin, pageWidth, pageHeight);

  // Observations
  yPos = addObservations(pdf, checklistData, yPos, margin, pageWidth, pageHeight);

  // Signature
  await addSignature(pdf, checklistData, yPos, margin, pageHeight);

  // FORÇA DOWNLOAD do PDF (não abre no navegador)
  const checklistDate = new Date(checklistData.created_at);
  const dateStr = checklistDate.toLocaleDateString('pt-BR');
  const fileName = `checklist-${checklistData.motorcycle_plate}-${dateStr.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
  
  return true;
};

// Função específica para gerar PDF do dashboard (reutiliza a função principal)
export const generateChecklistPDF = async (checklistData: Checklist, userId?: string) => {
  return await generatePDF(checklistData, userId);
};