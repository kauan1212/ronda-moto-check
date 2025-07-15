import jsPDF from 'jspdf';

// Função auxiliar para ler orientação EXIF de uma imagem
function getOrientation(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const view = new DataView(e.target.result);
    if (view.getUint16(0, false) !== 0xFFD8) return callback(-2);
    let length = view.byteLength, offset = 2;
    while (offset < length) {
      if (view.getUint16(offset + 2, false) <= 8) return callback(-1);
      let marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xFFE1) {
        if (view.getUint32(offset += 2, false) !== 0x45786966) return callback(-1);
        let little = view.getUint16(offset += 6, false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        let tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) === 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      } else if ((marker & 0xFF00) !== 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };
  reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
}

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
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Erro ao criar contexto do canvas');
          return;
        }
        // Buscar orientação EXIF se possível
        let orientation = 1;
        try {
          const response = await fetch(url, { mode: 'cors' });
          const blob = await response.blob();
          await new Promise((res) => getOrientation(blob, (o) => { orientation = o; res(undefined); }));
        } catch (e) { orientation = 1; }
        // Ajustar canvas conforme orientação
        let width = img.width, height = img.height;
        let drawWidth = width, drawHeight = height;
        let rotate = false;
        if (orientation > 4) { // landscape
          canvas.width = height;
          canvas.height = width;
          rotate = true;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        ctx.save();
        // Rotacionar se necessário
        switch (orientation) {
          case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
          case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
          case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
          case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
          case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
          case 7: ctx.transform(0, -1, -1, 0, height, width); break;
          case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
          default: break;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0);
        ctx.restore();
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

export const addImageToPDF = async (pdf: jsPDF, imageUrl: string, x: number, y: number, maxWidth: number, maxHeight: number): Promise<{width: number, height: number}> => {
  try {
    const base64Image = await loadImageAsBase64(imageUrl);
    // Carregar imagem para obter dimensões reais
    const img = new window.Image();
    img.src = base64Image;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const imgWidth = img.width;
    const imgHeight = img.height;
    // Calcular escala proporcional
    let renderWidth = maxWidth;
    let renderHeight = (imgHeight / imgWidth) * maxWidth;
    if (renderHeight > maxHeight) {
      renderHeight = maxHeight;
      renderWidth = (imgWidth / imgHeight) * maxHeight;
    }
    // Centralizar na célula
    const xCentered = x + (maxWidth - renderWidth) / 2;
    const yCentered = y + (maxHeight - renderHeight) / 2;
    pdf.addImage(base64Image, 'JPEG', xCentered, yCentered, renderWidth, renderHeight);
    return { width: renderWidth, height: renderHeight };
  } catch (error) {
    console.error('Erro ao adicionar imagem ao PDF:', error);
    pdf.setFontSize(8);
    pdf.setTextColor('#ef4444');
    pdf.text('Erro ao carregar foto', x, y + maxHeight / 2);
    pdf.setTextColor('#000000');
    return { width: 0, height: 0 };
  }
};