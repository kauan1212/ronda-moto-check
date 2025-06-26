
import jsPDF from 'jspdf';
import { Vigilante, Motorcycle, Checklist } from '@/types';

interface VehiclePhoto {
  url: string;
  category: 'front' | 'back' | 'left' | 'right';
}

interface ChecklistData extends Omit<Checklist, 'vehicle_photos'> {
  vehicle_photos: VehiclePhoto[];
}

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataURL);
    };
    img.onerror = () => resolve(''); // Return empty string if image fails to load
    img.src = url;
  });
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'front': return 'Frente';
    case 'back': return 'Trás';
    case 'left': return 'Lateral Esquerda';
    case 'right': return 'Lateral Direita';
    default: return category;
  }
};

export const generateChecklistPDF = async (
  checklistData: ChecklistData,
  vigilante: Vigilante,
  motorcycle: Motorcycle
) => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to check if we need a new page
  const checkNewPage = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * (fontSize * 0.6); // Return height used
  };

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RELATÓRIO DE VISTORIA DE VEÍCULO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Date and time
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('pt-BR');
  const timeStr = currentDate.toLocaleTimeString('pt-BR');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Data: ${dateStr} | Horário: ${timeStr}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Basic Information
  checkNewPage(60);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMAÇÕES BÁSICAS', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const basicInfo = [
    `Vigilante: ${vigilante.name}`,
    `Email: ${vigilante.email}`,
    `Matrícula: ${vigilante.registration}`,
    `Veículo: ${motorcycle.plate} - ${motorcycle.brand} ${motorcycle.model}`,
    `Ano: ${motorcycle.year} | Cor: ${motorcycle.color}`,
    `Tipo de Vistoria: ${checklistData.type === 'start' ? 'Início de Turno' : 'Fim de Turno'}`,
    `Quilometragem: ${checklistData.motorcycle_km || 'Não informado'}`
  ];

  basicInfo.forEach(info => {
    pdf.text(info, margin, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Inspection Items
  checkNewPage(80);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITENS VERIFICADOS', margin, yPosition);
  yPosition += 15;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return 'BOM';
      case 'regular': return 'REGULAR';
      case 'needs_repair': return 'NECESSÁRIO REPARO';
      case 'na': return 'N/A';
      default: return 'NÃO VERIFICADO';
    }
  };

  const inspectionItems = [
    { label: 'Pneus', status: checklistData.tires_status, observation: checklistData.tires_observation },
    { label: 'Freios', status: checklistData.brakes_status, observation: checklistData.brakes_observation },
    { label: 'Óleo do Motor', status: checklistData.engine_oil_status, observation: checklistData.engine_oil_observation },
    { label: 'Arrefecimento', status: checklistData.coolant_status, observation: checklistData.coolant_observation },
    { label: 'Iluminação', status: checklistData.lights_status, observation: checklistData.lights_observation },
    { label: 'Sistema Elétrico', status: checklistData.electrical_status, observation: checklistData.electrical_observation },
    { label: 'Suspensão', status: checklistData.suspension_status, observation: checklistData.suspension_observation },
    { label: 'Limpeza', status: checklistData.cleaning_status, observation: checklistData.cleaning_observation },
    { label: 'Vazamentos', status: checklistData.leaks_status, observation: checklistData.leaks_observation }
  ];

  pdf.setFontSize(12);
  inspectionItems.forEach(item => {
    checkNewPage(25);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${item.label}:`, margin, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    const statusText = `Status: ${getStatusLabel(item.status || '')}`;
    pdf.text(statusText, margin + 60, yPosition);
    yPosition += 8;
    
    if (item.observation) {
      pdf.setFont('helvetica', 'italic');
      const obsHeight = addWrappedText(`Observação: ${item.observation}`, margin + 10, yPosition, contentWidth - 10, 10);
      yPosition += obsHeight + 5;
    } else {
      yPosition += 5;
    }
  });

  // Photos section
  if (checklistData.vehicle_photos && checklistData.vehicle_photos.length > 0) {
    checkNewPage(100);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FOTOS DO VEÍCULO', margin, yPosition);
    yPosition += 15;

    try {
      for (const photo of checklistData.vehicle_photos) {
        checkNewPage(80);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${getCategoryLabel(photo.category)}:`, margin, yPosition);
        yPosition += 10;
        
        try {
          const imageData = await loadImageAsBase64(photo.url);
          if (imageData) {
            const imgWidth = 60;
            const imgHeight = 45;
            pdf.addImage(imageData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 15;
          }
        } catch (error) {
          console.error('Erro ao carregar imagem do veículo:', error);
          pdf.setFont('helvetica', 'italic');
          pdf.text('(Imagem não disponível)', margin, yPosition);
          yPosition += 15;
        }
      }
    } catch (error) {
      console.error('Erro ao processar fotos do veículo:', error);
    }
  }

  // Fuel photos
  if (checklistData.fuel_photos && checklistData.fuel_photos.length > 0) {
    checkNewPage(100);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FOTOS DO COMBUSTÍVEL', margin, yPosition);
    yPosition += 15;

    try {
      for (let i = 0; i < checklistData.fuel_photos.length; i++) {
        checkNewPage(80);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Foto ${i + 1}:`, margin, yPosition);
        yPosition += 10;
        
        try {
          const imageData = await loadImageAsBase64(checklistData.fuel_photos[i]);
          if (imageData) {
            const imgWidth = 60;
            const imgHeight = 45;
            pdf.addImage(imageData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 15;
          }
        } catch (error) {
          console.error('Erro ao carregar foto do combustível:', error);
          pdf.setFont('helvetica', 'italic');
          pdf.text('(Imagem não disponível)', margin, yPosition);
          yPosition += 15;
        }
      }
    } catch (error) {
      console.error('Erro ao processar fotos do combustível:', error);
    }
  }

  // KM photos
  if (checklistData.km_photos && checklistData.km_photos.length > 0) {
    checkNewPage(100);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FOTOS DO ODÔMETRO', margin, yPosition);
    yPosition += 15;

    try {
      for (let i = 0; i < checklistData.km_photos.length; i++) {
        checkNewPage(80);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Foto ${i + 1}:`, margin, yPosition);
        yPosition += 10;
        
        try {
          const imageData = await loadImageAsBase64(checklistData.km_photos[i]);
          if (imageData) {
            const imgWidth = 60;
            const imgHeight = 45;
            pdf.addImage(imageData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 15;
          }
        } catch (error) {
          console.error('Erro ao carregar foto do odômetro:', error);
          pdf.setFont('helvetica', 'italic');
          pdf.text('(Imagem não disponível)', margin, yPosition);
          yPosition += 15;
        }
      }
    } catch (error) {
      console.error('Erro ao processar fotos do odômetro:', error);
    }
  }

  // Face photo
  if (checklistData.face_photo) {
    checkNewPage(80);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FOTO FACIAL DO VIGILANTE', margin, yPosition);
    yPosition += 15;

    try {
      const imageData = await loadImageAsBase64(checklistData.face_photo);
      if (imageData) {
        const imgWidth = 60;
        const imgHeight = 45;
        pdf.addImage(imageData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      }
    } catch (error) {
      console.error('Erro ao carregar foto facial:', error);
      pdf.setFont('helvetica', 'italic');
      pdf.text('(Imagem não disponível)', margin, yPosition);
      yPosition += 15;
    }
  }

  // Observations
  if (checklistData.general_observations || checklistData.damages) {
    checkNewPage(60);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVAÇÕES', margin, yPosition);
    yPosition += 15;

    if (checklistData.general_observations) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Observações Gerais:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      const obsHeight = addWrappedText(checklistData.general_observations, margin, yPosition, contentWidth, 12);
      yPosition += obsHeight + 10;
    }

    if (checklistData.damages) {
      checkNewPage(30);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Danos Identificados:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      const damageHeight = addWrappedText(checklistData.damages, margin, yPosition, contentWidth, 12);
      yPosition += damageHeight + 10;
    }
  }

  // Signature
  if (checklistData.signature) {
    checkNewPage(80);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ASSINATURA DO VIGILANTE', margin, yPosition);
    yPosition += 15;

    try {
      const imgWidth = 80;
      const imgHeight = 30;
      pdf.addImage(checklistData.signature, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Erro ao adicionar assinatura:', error);
      pdf.setFont('helvetica', 'italic');
      pdf.text('(Assinatura não disponível)', margin, yPosition);
      yPosition += 15;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Vigilante: ${vigilante.name}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Data e Hora: ${dateStr} às ${timeStr}`, margin, yPosition);
  }

  // Footer
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    pdf.text(`Relatório gerado em ${dateStr} às ${timeStr}`, margin, pageHeight - 10);
  }

  // Save the PDF
  const fileName = `checklist-${motorcycle.plate}-${dateStr.replace(/\//g, '-')}-${timeStr.replace(/:/g, '-')}.pdf`;
  pdf.save(fileName);
};
