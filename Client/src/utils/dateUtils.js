export const formatToPacificDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  export const formatToPacificDateTime = (date, time) => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
    return `${formattedDate}, ${time}`;
  };
  
  export const getCurrentPacificDate = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  };