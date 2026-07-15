export const numberToWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "";
  
  const absoluteVal = Math.abs(Number(num));
  const integerPart = Math.floor(absoluteVal);
  const decimalPart = Math.round((absoluteVal - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return "Rupees Zero Only";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  const helper = (number) => {
    let str = "";
    if (number >= 100) {
      str += ones[Math.floor(number / 100)] + " Hundred ";
      number %= 100;
    }
    if (number >= 20) {
      str += tens[Math.floor(number / 10)] + " ";
      number %= 10;
    }
    if (number > 0) {
      str += ones[number] + " ";
    }
    return str.trim();
  };

  let result = "";
  let temp = integerPart;

  if (temp >= 10000000) {
    result += helper(Math.floor(temp / 10000000)) + " Crore ";
    temp %= 10000000;
  }
  if (temp >= 100000) {
    result += helper(Math.floor(temp / 100000)) + " Lakh ";
    temp %= 100000;
  }
  if (temp >= 1000) {
    result += helper(Math.floor(temp / 1000)) + " Thousand ";
    temp %= 1000;
  }
  if (temp > 0) {
    result += helper(temp);
  }

  let finalWord = "Rupees " + (result.trim() || "Zero");

  if (decimalPart > 0) {
    finalWord += " and " + helper(decimalPart) + " Paise";
  }

  finalWord += " Only";
  
  return finalWord.trim().replace(/\s+/g, " ");
};
