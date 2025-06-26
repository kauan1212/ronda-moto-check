
import jsPDF from 'jspdf';
import { ChecklistData } from '@/types';

export const generatePDF = async (data: ChecklistData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Header with logo
  try {
    const logoResponse = await fetch('/lovable-uploads/2c80dbd7-a4ae-44cb-ad84-3b14b0d68244.png');
    const logoBlob = await logoResponse.blob();
    const logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });
    
    doc.addImage(logoBase64, 'PNG', margin, currentY, 30, 30);
  } catch (error) {
    console.log('Erro ao carregar logo:', error);
  }

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('VIGIO SYSTEM', margin + 35, currentY + 15);
  doc.setFontSize(16);
  doc.text('Checklist de Vigilância', margin + 35, currentY + 25);
  
  currentY += 45;

  // Date and Time
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${data.date}`, margin, currentY);
  doc.text(`Horário: ${data.time}`, margin + 80, currentY);
  currentY += 15;

  // Personnel Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DO PESSOAL', margin, currentY);
  currentY += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Vigilante: ${data.vigilante?.name || 'N/A'}`, margin, currentY);
  currentY += 7;
  doc.text(`Motocicleta: ${data.motorcycle?.model || 'N/A'} - ${data.motorcycle?.plate || 'N/A'}`, margin, currentY);
  currentY += 15;

  // Face Photo
  if (data.facePhoto) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FOTO FACIAL DO VIGILANTE', margin, currentY);
    currentY += 10;
    
    try {
      doc.addImage(data.facePhoto, 'JPEG', margin, currentY, 50, 50);
      currentY += 60;
    } catch (error) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Erro ao processar foto facial', margin, currentY);
      currentY += 15;
    }
  }

  // Check if we need a new page
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = margin;
  }

  // Inspection Items
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ITENS DE INSPEÇÃO', margin, currentY);
  currentY += 10;

  const inspectionItems = [
    { label: 'Freios', value: data.brakes },
    { label: 'Pneus', value: data.tires },
    { label: 'Luzes', value: data.lights },
    { label: 'Sinalização', value: data.signals },
    { label: 'Espelhos', value: data.mirrors },
    { label: 'Documentação', value: data.documentation }
  ];

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  inspectionItems.forEach(item => {
    const status = item.value ? '✓ OK' : '✗ Problema';
    const color = item.value ? [0, 150, 0] : [200, 0, 0];
    doc.setTextColor(...color);
    doc.text(`${item.label}: ${status}`, margin, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 7;
  });

  currentY += 10;

  // Vehicle Photos
  if (data.vehiclePhotos && data.vehiclePhotos.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FOTOS DO VEÍCULO', margin, currentY);
    currentY += 10;

    let photoX = margin;
    let photoY = currentY;
    const photoSize = 40;
    const photosPerRow = Math.floor(contentWidth / (photoSize + 10));

    data.vehiclePhotos.forEach((photo, index) => {
      if (index > 0 && index % photosPerRow === 0) {
        photoY += photoSize + 10;
        photoX = margin;
        
        // Check if we need a new page
        if (photoY > pageHeight - photoSize - 20) {
          doc.addPage();
          photoY = margin;
        }
      }

      try {
        doc.addImage(photo, 'JPEG', photoX, photoY, photoSize, photoSize);
      } catch (error) {
        doc.setFontSize(8);
        doc.text('Erro na foto', photoX, photoY + 10);
      }

      photoX += photoSize + 10;
    });

    currentY = photoY + photoSize + 20;
  }

  // Check if we need a new page
  if (currentY > pageHeight - 150) {
    doc.addPage();
    currentY = margin;
  }

  // Fuel Photos
  if (data.fuelPhotos && data.fuelPhotos.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FOTOS DO COMBUSTÍVEL', margin, currentY);
    currentY += 10;

    let photoX = margin;
    let photoY = currentY;
    const photoSize = 40;
    const photosPerRow = Math.floor(contentWidth / (photoSize + 10));

    data.fuelPhotos.forEach((photo, index) => {
      if (index > 0 && index % photosPerRow === 0) {
        photoY += photoSize + 10;
        photoX = margin;
        
        if (photoY > pageHeight - photoSize - 20) {
          doc.addPage();
          photoY = margin;
        }
      }

      try {
        doc.addImage(photo, 'JPEG', photoX, photoY, photoSize, photoSize);
      } catch (error) {
        doc.setFontSize(8);
        doc.text('Erro na foto', photoX, photoY + 10);
      }

      photoX += photoSize + 10;
    });

    currentY = photoY + photoSize + 20;
  }

  // Kilometer Section
  if (data.kilometers !== undefined || (data.kilometerPhotos && data.kilometerPhotos.length > 0)) {
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('QUILOMETRAGEM', margin, currentY);
    currentY += 10;

    if (data.kilometers !== undefined) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Quilômetros: ${data.kilometers} km`, margin, currentY);
      currentY += 10;
    }

    if (data.kilometerPhotos && data.kilometerPhotos.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Fotos do Hodômetro:', margin, currentY);
      currentY += 10;

      let photoX = margin;
      let photoY = currentY;
      const photoSize = 40;

      data.kilometerPhotos.forEach((photo, index) => {
        if (index > 0 && index % 3 === 0) {
          photoY += photoSize + 10;
          photoX = margin;
        }

        try {
          doc.addImage(photo, 'JPEG', photoX, photoY, photoSize, photoSize);
        } catch (error) {
          doc.setFontSize(8);
          doc.text('Erro na foto', photoX, photoY + 10);
        }

        photoX += photoSize + 10;
      });

      currentY = photoY + photoSize + 20;
    }
  }

  // Observations
  if (data.observations || data.damages) {
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', margin, currentY);
    currentY += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    if (data.observations) {
      const observationLines = doc.splitTextToSize(data.observations, contentWidth);
      doc.text(observationLines, margin, currentY);
      currentY += observationLines.length * 5 + 10;
    }

    if (data.damages) {
      doc.setFont('helvetica', 'bold');
      doc.text('Danos relatados:', margin, currentY);
      currentY += 7;
      doc.setFont('helvetica', 'normal');
      const damageLines = doc.splitTextToSize(data.damages, contentWidth);
      doc.text(damageLines, margin, currentY);
      currentY += damageLines.length * 5 + 10;
    }
  }

  // Signature
  if (data.signature) {
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ASSINATURA DO VIGILANTE', margin, currentY);
    currentY += 10;

    try {
      doc.addImage(data.signature, 'PNG', margin, currentY, 80, 40);
      currentY += 50;
    } catch (error) {
      doc.setFontSize(10);
      doc.text('Erro ao processar assinatura', margin, currentY);
      currentY += 15;
    }
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Relatório gerado pelo Vigio System', margin, footerY);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - margin - 60, footerY);

  return doc;
};
