import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MONTHS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string = "PHP"): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currency codes
    return currencyCode + ' ' + amount.toLocaleString();
  }
}

export function getMonthName(monthNumber: number): string {
  const month = MONTHS.find(m => m.value === monthNumber);
  return month ? month.name : '';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getRandomColor(): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateDateRangeText(startDate?: Date, endDate?: Date): string {
  if (!startDate || !endDate) return "Dates not set";
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const formatter = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `${formatter.format(start)} - ${formatter.format(end)}, ${end.getFullYear()}`;
}

export function calculateTripDuration(startDate?: Date, endDate?: Date): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate difference in milliseconds and convert to days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
  // Require at least 8 characters, one uppercase, one lowercase, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export const validateImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Simple URL validation, can be enhanced for more specific image URL patterns
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
