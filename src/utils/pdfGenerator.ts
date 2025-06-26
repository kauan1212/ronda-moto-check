
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Checklist } from '@/types';

export const generateChecklistPDF = async (checklist: Checklist) => {
  const pdf = new jsPDF();
  
  // Create HTML content for the PDF
  const htmlContent = document.createElement('div');
  htmlContent.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 10px;">RELATÓRIO DE VISTORIA DE MOTOCICLETA</h1>
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <strong style="color: #1e40af;">Data:</strong> ${new Date().toLocaleDateString('pt-BR')} | 
          <strong style="color: #1e40af;">Horário:</strong> ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; margin-bottom: 15px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">📋 Informações da Vistoria</h3>
          <p><strong>Tipo:</strong> ${checklist.type === 'start' ? 'Início de Turno' : 'Fim de Turno'}</p>
          <p><strong>Status:</strong> ${checklist.status}</p>
          <p><strong>Quilometragem:</strong> ${checklist.motorcycle_km || 'Não informado'}</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; margin-bottom: 15px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">👮 Vigilante Responsável</h3>
          <p><strong>Nome:</strong> ${checklist.vigilante_name}</p>
          <p><strong>ID:</strong> ${checklist.vigilante_id}</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; margin-bottom: 15px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">🏍️ Dados da Motocicleta</h3>
          <p><strong>Placa:</strong> ${checklist.motorcycle_plate}</p>
          <p><strong>ID:</strong> ${checklist.motorcycle_id}</p>
        </div>
      </div>

      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">🔍 ITENS VERIFICADOS</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0;">
        ${createInspectionItem('🛞 Pneus', checklist.tires_status, checklist.tires_observation)}
        ${createInspectionItem('🛑 Freios', checklist.brakes_status, checklist.brakes_observation)}
        ${createInspectionItem('🛢️ Óleo do Motor', checklist.engine_oil_status, checklist.engine_oil_observation)}
        ${createInspectionItem('🌡️ Arrefecimento', checklist.coolant_status, checklist.coolant_observation)}
        ${createInspectionItem('💡 Sistema de Iluminação', checklist.lights_status, checklist.lights_observation)}
        ${createInspectionItem('⚡ Sistema Elétrico', checklist.electrical_status, checklist.electrical_observation)}
        ${createInspectionItem('🔧 Suspensão', checklist.suspension_status, checklist.suspension_observation)}
        ${createInspectionItem('🧽 Limpeza', checklist.cleaning_status, checklist.cleaning_observation)}
        ${createInspectionItem('💧 Vazamentos', checklist.leaks_status, checklist.leaks_observation)}
      </div>

      ${checklist.general_observations ? `
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-bottom: 15px;">📝 Observações Gerais</h3>
        <p>${checklist.general_observations}</p>
      </div>
      ` : ''}

      ${checklist.damages ? `
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-bottom: 15px;">⚠️ Danos Identificados</h3>
        <p>${checklist.damages}</p>
      </div>
      ` : ''}

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-bottom: 15px;">📸 Registros Fotográficos</h3>
        <p><strong>Fotos da Motocicleta:</strong> ${checklist.motorcycle_photos.length} foto(s) registrada(s)</p>
        <p><strong>Fotos do Combustível:</strong> ${checklist.fuel_photos.length} foto(s) registrada(s)</p>
        <p><strong>Fotos do Odômetro:</strong> ${checklist.km_photos.length} foto(s) registrada(s)</p>
        ${checklist.face_photo ? '<p><strong>Foto Facial:</strong> 1 foto registrada</p>' : ''}
      </div>

      ${checklist.signature ? `
      <div style="background-color: #ffffff; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-bottom: 15px;">✍️ Assinatura do Vigilante</h3>
        <img src="${checklist.signature}" alt="Assinatura" style="max-width: 300px; border: 1px solid #d1d5db; border-radius: 4px;">
        <p style="margin-top: 15px;"><strong>Vigilante:</strong> ${checklist.vigilante_name}</p>
        <p><strong>Data e Hora:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
      ` : ''}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Relatório gerado automaticamente pelo Sistema de Gestão de Vigilância</p>
        <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>
  `;

  // Add the HTML content to the document body temporarily
  document.body.appendChild(htmlContent);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(htmlContent, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove the temporary element
    document.body.removeChild(htmlContent);

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(`checklist-${checklist.motorcycle_plate}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    document.body.removeChild(htmlContent);
    throw error;
  }
};

function createInspectionItem(title: string, status?: string, observation?: string): string {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return 'Bom';
      case 'regular': return 'Regular';
      case 'needs_repair': return 'Precisa Reparo';
      case 'na': return 'N/A';
      default: return 'Não verificado';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'good': return 'background-color: #dcfce7; color: #166534;';
      case 'regular': return 'background-color: #fef3c7; color: #92400e;';
      case 'needs_repair': return 'background-color: #fee2e2; color: #991b1b;';
      case 'na': return 'background-color: #f3f4f6; color: #6b7280;';
      default: return 'background-color: #f3f4f6; color: #6b7280;';
    }
  };

  return `
    <div style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px;">
      <h4 style="color: #374151; margin-bottom: 10px; font-size: 16px; font-weight: bold;">${title}</h4>
      <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; ${getStatusClass(status || '')}">${getStatusLabel(status || '')}</div>
      ${observation ? `<div style="background-color: #f9fafb; padding: 10px; border-radius: 4px; font-style: italic; color: #6b7280;">${observation}</div>` : ''}
    </div>
  `;
}
