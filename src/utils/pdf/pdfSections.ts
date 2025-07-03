import jsPDF from 'jspdf';
import { Checklist } from '@/types';
import { getStatusLabel, getStatusColor } from './statusHelpers';
import { addImageToPDF } from './imageHelpers';

export const addHeader = async (pdf: jsPDF, userLogo: string, yPos: number, margin: number) => {
  // Header com logo personalizada
  try {
    await addImageToPDF(pdf, userLogo, margin, yPos - 5, 30, 20);
  } catch (error) {
    console.error('Erro ao carregar logo no PDF:', error);
  }

  // Título ao lado da logo
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RELATÓRIO DE VISTORIA DE VEÍCULO', margin + 35, yPos + 8);
  
  return yPos + 25;
};

export const addBasicInfo = (pdf: jsPDF, checklistData: Checklist, yPos: number, margin: number, pageWidth: number) => {
  // Date and time - usar a data de criação do checklist
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const checklistDate = new Date(checklistData.created_at);
  const dateStr = checklistDate.toLocaleDateString('pt-BR');
  const timeStr = checklistDate.toLocaleTimeString('pt-BR');
  pdf.text(`Data: ${dateStr} | Horário: ${timeStr}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Basic Information
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMAÇÕES BÁSICAS', margin, yPos);
  yPos += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const basicInfo = [
    `Tipo: ${checklistData.type === 'start' ? 'Início de Turno' : 'Fim de Turno'}`,
    `Vigilante: ${checklistData.vigilante_name}`,
    `Veículo: ${checklistData.motorcycle_plate}`,
    `Quilometragem: ${checklistData.motorcycle_km || 'Não informado'}`,
    `Nível de Combustível: ${checklistData.fuel_level}%`,
    `Status: Concluída`
  ];

  const lineHeight = 8;
  basicInfo.forEach(info => {
    pdf.text(info, margin, yPos);
    yPos += lineHeight;
  });

  return yPos + 10;
};

export const addInspectionItems = (pdf: jsPDF, checklistData: Checklist, yPos: number, margin: number, pageWidth: number, pageHeight: number) => {
  const lineHeight = 8;
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITENS VERIFICADOS', margin, yPos);
  yPos += 10;

  const inspectionItems = [
    { key: 'tires', label: 'Pneus' },
    { key: 'brakes', label: 'Freios' },
    { key: 'engine_oil', label: 'Óleo do Motor' },
    { key: 'coolant', label: 'Líquido de Arrefecimento' },
    { key: 'lights', label: 'Sistema de Iluminação' },
    { key: 'electrical', label: 'Sistema Elétrico' },
    { key: 'suspension', label: 'Suspensão' },
    { key: 'cleaning', label: 'Limpeza' },
    { key: 'leaks', label: 'Vazamentos' }
  ];

  inspectionItems.forEach(item => {
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 20;
    }

    const statusKey = `${item.key}_status` as keyof Checklist;
    const observationKey = `${item.key}_observation` as keyof Checklist;
    const status = checklistData[statusKey] as string || '';
    const observation = checklistData[observationKey] as string || '';

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.label, margin, yPos);
    
    // Status with color
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const statusText = getStatusLabel(status);
    const statusColor = getStatusColor(status);
    pdf.setTextColor(statusColor);
    pdf.text(`Status: ${statusText}`, margin + 80, yPos);
    pdf.setTextColor('#000000');

    yPos += lineHeight;

    if (observation) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const splitObservation = pdf.splitTextToSize(`Observação: ${observation}`, pageWidth - 2 * margin);
      pdf.text(splitObservation, margin, yPos);
      yPos += splitObservation.length * 5;
    }

    yPos += 5;
  });

  return yPos;
};

export const addPhotosSection = async (pdf: jsPDF, checklistData: Checklist, yPos: number, margin: number, pageWidth: number, pageHeight: number) => {
  // Photos section
  if (yPos > pageHeight - 60) {
    pdf.addPage();
    yPos = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REGISTROS FOTOGRÁFICOS', margin, yPos);
  yPos += 15;

  // Vehicle photos - com melhor qualidade e organização
  const vehiclePhotos = checklistData.motorcycle_photos || [];
  if (vehiclePhotos.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Fotos do Veículo (${vehiclePhotos.length} fotos):`, margin, yPos);
    yPos += 10;

    const photoWidth = 140; // Aumentado de 120 para 140
    const photoHeight = 105; // Aumentado de 90 para 105
    const photosPerRow = 2;
    let currentPhotoIndex = 0;

    for (let i = 0; i < vehiclePhotos.length; i++) {
      const photoUrl = vehiclePhotos[i];
      
      if (yPos > pageHeight - 120) {
        pdf.addPage();
        yPos = 20;
        currentPhotoIndex = 0;
      }

      const xPos = margin + (currentPhotoIndex % photosPerRow) * (photoWidth + 15);
      
      // Add category label
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      const categories = ['Frente', 'Trás', 'Lateral Esquerda', 'Lateral Direita', 'Adicional'];
      pdf.text(categories[i % 5] || `Foto ${i + 1}`, xPos, yPos - 2);
      
      await addImageToPDF(pdf, photoUrl, xPos, yPos, photoWidth, photoHeight);

      currentPhotoIndex++;
      if (currentPhotoIndex % photosPerRow === 0) {
        yPos += photoHeight + 25;
      }
    }

    if (currentPhotoIndex % photosPerRow !== 0) {
      yPos += photoHeight + 25;
    }
  }

  // Fuel photos - com melhor qualidade
  const fuelPhotos = checklistData.fuel_photos || [];
  if (fuelPhotos.length > 0) {
    if (yPos > pageHeight - 100) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Fotos do Combustível (${fuelPhotos.length} fotos):`, margin, yPos);
    yPos += 10;

    const photoWidth = 120; // Aumentado de 100 para 120
    const photoHeight = 90; // Aumentado de 75 para 90
    const photosPerRow = 2;
    let currentPhotoIndex = 0;

    for (const photoUrl of fuelPhotos) {
      if (yPos > pageHeight - 90) {
        pdf.addPage();
        yPos = 20;
        currentPhotoIndex = 0;
      }

      const xPos = margin + (currentPhotoIndex % photosPerRow) * (photoWidth + 15);
      await addImageToPDF(pdf, photoUrl, xPos, yPos, photoWidth, photoHeight);

      currentPhotoIndex++;
      if (currentPhotoIndex % photosPerRow === 0) {
        yPos += photoHeight + 20;
      }
    }

    if (currentPhotoIndex % photosPerRow !== 0) {
      yPos += photoHeight + 20;
    }
  }

  // Odometer photos - com melhor qualidade
  const kmPhotos = checklistData.km_photos || [];
  if (kmPhotos.length > 0) {
    if (yPos > pageHeight - 100) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Fotos do Odômetro (${kmPhotos.length} fotos):`, margin, yPos);
    yPos += 10;

    const photoWidth = 120; // Aumentado de 100 para 120
    const photoHeight = 90; // Aumentado de 75 para 90
    const photosPerRow = 2;
    let currentPhotoIndex = 0;

    for (const photoUrl of kmPhotos) {
      if (yPos > pageHeight - 90) {
        pdf.addPage();
        yPos = 20;
        currentPhotoIndex = 0;
      }

      const xPos = margin + (currentPhotoIndex % photosPerRow) * (photoWidth + 15);
      await addImageToPDF(pdf, photoUrl, xPos, yPos, photoWidth, photoHeight);

      currentPhotoIndex++;
      if (currentPhotoIndex % photosPerRow === 0) {
        yPos += photoHeight + 20;
      }
    }

    if (currentPhotoIndex % photosPerRow !== 0) {
      yPos += photoHeight + 20;
    }
  }

  // Face photo - com melhor qualidade
  if (checklistData.face_photo) {
    if (yPos > pageHeight - 100) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Foto Facial:', margin, yPos);
    yPos += 10;

    await addImageToPDF(pdf, checklistData.face_photo, margin, yPos, 120, 95); // Aumentado de 100x80 para 120x95
    yPos += 100;
  }

  return yPos;
};

export const addObservations = (pdf: jsPDF, checklistData: Checklist, yPos: number, margin: number, pageWidth: number, pageHeight: number) => {
  const lineHeight = 8;
  
  if (checklistData.general_observations || checklistData.damages) {
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVAÇÕES', margin, yPos);
    yPos += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    if (checklistData.general_observations) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Observações Gerais:', margin, yPos);
      yPos += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      const splitObservations = pdf.splitTextToSize(checklistData.general_observations, pageWidth - 2 * margin);
      pdf.text(splitObservations, margin, yPos);
      yPos += splitObservations.length * 6 + 5;
    }

    if (checklistData.damages) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Danos Identificados:', margin, yPos);
      yPos += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      const splitDamages = pdf.splitTextToSize(checklistData.damages, pageWidth - 2 * margin);
      pdf.text(splitDamages, margin, yPos);
      yPos += splitDamages.length * 6;
    }
  }

  return yPos;
};

export const addSignature = async (pdf: jsPDF, checklistData: Checklist, yPos: number, margin: number, pageHeight: number) => {
  if (checklistData.signature) {
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ASSINATURA', margin, yPos);
    yPos += 10;

    await addImageToPDF(pdf, checklistData.signature, margin, yPos, 140, 70); // Aumentado de 120x60 para 140x70
    
    yPos += 75;
    pdf.setFontSize(10);
    const checklistDate = new Date(checklistData.created_at);
    const dateStr = checklistDate.toLocaleDateString('pt-BR');
    const timeStr = checklistDate.toLocaleTimeString('pt-BR');
    pdf.text(`Vigilante: ${checklistData.vigilante_name}`, margin, yPos);
    pdf.text(`Data: ${dateStr} às ${timeStr}`, margin, yPos + 6);
  }

  return yPos;
};