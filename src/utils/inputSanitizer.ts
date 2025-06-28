
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove any HTML tags and potential XSS vectors
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  // Additional cleaning for SQL injection prevention
  return sanitized
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 1000); // Limit length
};

export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não permitido. Use apenas JPG, PNG ou WebP.'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Arquivo muito grande. Máximo 5MB permitido.'
    };
  }

  // Check file header for additional security
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = new Uint8Array(e.target?.result as ArrayBuffer);
      const header = Array.from(buffer.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Check for valid image headers
      const validHeaders = [
        'ffd8ffe0', // JPEG
        'ffd8ffe1', // JPEG
        'ffd8ffe2', // JPEG
        '89504e47', // PNG
        '52494646', // WebP (RIFF)
      ];

      const isValidHeader = validHeaders.some(validHeader => 
        header.toLowerCase().startsWith(validHeader.toLowerCase())
      );

      resolve({
        isValid: isValidHeader,
        error: isValidHeader ? undefined : 'Arquivo corrompido ou não é uma imagem válida.'
      });
    };
    
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};
