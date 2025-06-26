
import jsPDF from 'jspdf';
import { Checklist } from '@/types';

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'good': return 'Bom';
    case 'regular': return 'Regular';
    case 'needs_repair': return 'Precisa Reparo';
    case 'na': return 'N/A';
    default: return 'Não verificado';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good': return '#22c55e';
    case 'regular': return '#eab308';
    case 'needs_repair': return '#ef4444';
    case 'na': return '#6b7280';
    default: return '#9ca3af';
  }
};

export const generatePDF = (checklistData: Checklist) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;
  const margin = 20;
  const lineHeight = 8;

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RELATÓRIO DE VISTORIA DE VEÍCULO', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Date and time
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('pt-BR');
  const timeStr = currentDate.toLocaleTimeString('pt-BR');
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
    `Status: Concluída`
  ];

  basicInfo.forEach(info => {
    pdf.text(info, margin, yPos);
    yPos += lineHeight;
  });

  yPos += 10;

  // Inspection Items
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
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    const statusText = getStatusLabel(status);
    const statusColor = getStatusColor(status);
    pdf.setTextColor(statusColor);
    pdf.text(`Status: ${statusText}`, margin + 80, yPos);
    pdf.setTextColor('#000000');

    yPos += lineHeight;

    if (observation) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const splitObservation = pdf.splitTextToSize(`Observação: ${observation}`, pageWidth - 2 * margin);
      pdf.text(splitObservation, margin, yPos);
      yPos += splitObservation.length * 4;
    }

    yPos += 5;
  });

  // Photos section
  if (yPos > pageHeight - 60) {
    pdf.addPage();
    yPos = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REGISTROS FOTOGRÁFICOS', margin, yPos);
  yPos += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  const photoInfo = [
    `Fotos do Veículo: ${checklistData.vehicle_photos?.length || 0} foto(s)`,
    `Fotos do Combustível: ${checklistData.fuel_photos?.length || 0} foto(s)`,
    `Fotos do Odômetro: ${checklistData.km_photos?.length || 0} foto(s)`,
    `Foto Facial: ${checklistData.face_photo ? '1 foto' : 'Não capturada'}`
  ];

  photoInfo.forEach(info => {
    pdf.text(info, margin, yPos);
    yPos += lineHeight;
  });

  // Add photos if available
  let photoYPos = yPos + 10;
  const photoWidth = 60;
  const photoHeight = 45;
  let photosPerRow = 2;
  let currentPhotoIndex = 0;

  // Vehicle photos
  if (checklistData.vehicle_photos && checklistData.vehicle_photos.length > 0) {
    if (photoYPos > pageHeight - 60) {
      pdf.addPage();
      photoYPos = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fotos do Veículo:', margin, photoYPos);
    photoYPos += 10;

    checklistData.vehicle_photos.forEach((photo: any, index: number) => {
      if (photoYPos > pageHeight - 60) {
        pdf.addPage();
        photoYPos = 20;
        currentPhotoIndex = 0;
      }

      const xPos = margin + (currentPhotoIndex % photosPerRow) * (photoWidth + 10);
      
      try {
        pdf.addImage(photo.url, 'JPEG', xPos, photoYPos, photoWidth, photoHeight);
        
        // Add category label
        pdf.setFontSize(8);
        pdf.text(photo.category === 'front' ? 'Frente' : 
                photo.category === 'back' ? 'Trás' : 
                photo.category === 'left' ? 'Esquerda' : 'Direita', 
                xPos, photoYPos - 2);
      } catch (error) {
        console.error('Erro ao adicionar foto:', error);
        pdf.setFontSize(8);
        pdf.text('Erro ao carregar foto', xPos, photoYPos + photoHeight / 2);
      }

      currentPhotoIndex++;
      if (currentPhotoIndex % photosPerRow === 0) {
        photoYPos += photoHeight + 15;
      }
    });

    if (currentPhotoIndex % photosPerRow !== 0) {
      photoYPos += photoHeight + 15;
    }
  }

  // Observations
  if (checklistData.general_observations || checklistData.damages) {
    if (photoYPos > pageHeight - 40) {
      pdf.addPage();
      photoYPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVAÇÕES', margin, photoYPos);
    photoYPos += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    if (checklistData.general_observations) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Observações Gerais:', margin, photoYPos);
      photoYPos += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      const splitObservations = pdf.splitTextToSize(checklistData.general_observations, pageWidth - 2 * margin);
      pdf.text(splitObservations, margin, photoYPos);
      photoYPos += splitObservations.length * 6 + 5;
    }

    if (checklistData.damages) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Danos Identificados:', margin, photoYPos);
      photoYPos += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      const splitDamages = pdf.splitTextToSize(checklistData.damages, pageWidth - 2 * margin);
      pdf.text(splitDamages, margin, photoYPos);
      photoYPos += splitDamages.length * 6;
    }
  }

  // Signature
  if (checklistData.signature) {
    if (photoYPos > pageHeight - 60) {
      pdf.addPage();
      photoYPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ASSINATURA', margin, photoYPos);
    photoYPos += 10;

    try {
      pdf.addImage(checklistData.signature, 'PNG', margin, photoYPos, 80, 40);
    } catch (error) {
      console.error('Erro ao adicionar assinatura:', error);
      pdf.setFontSize(10);
      pdf.text('Erro ao carregar assinatura', margin, photoYPos);
    }
    
    photoYPos += 45;
    pdf.setFontSize(10);
    pdf.text(`Vigilante: ${checklistData.vigilante_name}`, margin, photoYPos);
    pdf.text(`Data: ${dateStr} às ${timeStr}`, margin, photoYPos + 6);
  }

  // Save the PDF
  const fileName = `checklist-${checklistData.motorcycle_plate}-${dateStr.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
};
