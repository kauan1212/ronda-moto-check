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

const loadImageAsBase64 = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      reject('URL inválida');
      return;
    }

    // Se já é base64, retorna direto
    if (url.startsWith('data:')) {
      resolve(url);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject('Erro ao criar contexto do canvas');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        resolve(base64);
      } catch (error) {
        console.error('Erro ao converter imagem:', error);
        reject('Erro ao processar imagem');
      }
    };
    
    img.onerror = () => {
      console.error('Erro ao carregar imagem:', url);
      reject('Erro ao carregar imagem');
    };
    
    img.src = url;
  });
};

const addImageToPDF = async (pdf: jsPDF, imageUrl: string, x: number, y: number, width: number, height: number): Promise<boolean> => {
  try {
    const base64Image = await loadImageAsBase64(imageUrl);
    pdf.addImage(base64Image, 'JPEG', x, y, width, height);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar imagem ao PDF:', error);
    pdf.setFontSize(8);
    pdf.setTextColor('#ef4444');
    pdf.text('Erro ao carregar foto', x, y + height / 2);
    pdf.setTextColor('#000000');
    return false;
  }
};

// Função principal para gerar PDF - força download
export const generatePDF = async (checklistData: Checklist) => {
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
    `Nível de Combustível: ${checklistData.fuel_level}%`,
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

    const photoWidth = 80;
    const photoHeight = 60;
    const photosPerRow = 2;
    let currentPhotoIndex = 0;

    for (let i = 0; i < vehiclePhotos.length; i++) {
      const photoUrl = vehiclePhotos[i];
      
      if (yPos > pageHeight - 80) {
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
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Fotos do Combustível (${fuelPhotos.length} fotos):`, margin, yPos);
    yPos += 10;

    const photoWidth = 70;
    const photoHeight = 50;
    const photosPerRow = 2;
    let currentPhotoIndex = 0;

    for (const photoUrl of fuelPhotos) {
      if (yPos > pageHeight - 70) {
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
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Fotos do Odômetro (${kmPhotos.length} fotos):`, margin, yPos);
    yPos += 10;

    const photoWidth = 70;
    const photoHeight = 50;
    const photosPerRow = 2;
    let currentPhotoIndex = 0;

    for (const photoUrl of kmPhotos) {
      if (yPos > pageHeight - 70) {
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
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Foto Facial:', margin, yPos);
    yPos += 10;

    await addImageToPDF(pdf, checklistData.face_photo, margin, yPos, 70, 55);
    yPos += 60;
  }

  // Observations
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

  // Signature
  if (checklistData.signature) {
    if (yPos > pageHeight - 60) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ASSINATURA', margin, yPos);
    yPos += 10;

    await addImageToPDF(pdf, checklistData.signature, margin, yPos, 80, 40);
    
    yPos += 45;
    pdf.setFontSize(10);
    pdf.text(`Vigilante: ${checklistData.vigilante_name}`, margin, yPos);
    pdf.text(`Data: ${dateStr} às ${timeStr}`, margin, yPos + 6);
  }

  // FORÇA DOWNLOAD do PDF (não abre no navegador)
  const fileName = `checklist-${checklistData.motorcycle_plate}-${dateStr.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
  
  return true;
};

// Função específica para gerar PDF do dashboard (reutiliza a função principal)
export const generateChecklistPDF = async (checklistData: Checklist) => {
  return await generatePDF(checklistData);
};
