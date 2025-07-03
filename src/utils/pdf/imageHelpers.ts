import jsPDF from 'jspdf';

export const loadImageAsBase64 = async (url: string): Promise<string> => {
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

        // Aumentar a resolução para melhor qualidade
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Configurar contexto para melhor qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);
        
        ctx.drawImage(img, 0, 0);
        
        // Aumentar qualidade JPEG para 100%
        const base64 = canvas.toDataURL('image/jpeg', 1.0);
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

export const addImageToPDF = async (pdf: jsPDF, imageUrl: string, x: number, y: number, width: number, height: number): Promise<boolean> => {
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