export function isValidStellarAddress(address) {
    return /^[G][A-Z2-7]{55}$/.test(address);
  }
  
  export function isValidAmount(amount) {
    return /^\d+(\.\d+)?$/.test(amount);
  }