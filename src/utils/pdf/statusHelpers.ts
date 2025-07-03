export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'good': return 'Bom';
    case 'regular': return 'Regular';
    case 'needs_repair': return 'Precisa Reparo';
    case 'na': return 'N/A';
    default: return 'Não verificado';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'good': return '#22c55e';
    case 'regular': return '#eab308';
    case 'needs_repair': return '#ef4444';
    case 'na': return '#6b7280';
    default: return '#9ca3af';
  }
};