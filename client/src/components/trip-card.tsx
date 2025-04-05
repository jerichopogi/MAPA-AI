import { Link } from "wouter";
import { Trip } from "@/lib/types";
import { Routes } from "@/lib/constants";
import { formatCurrency, generateDateRangeText } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
}

const TripCard = ({ trip }: TripCardProps) => {
  // Get a destination image based on the country (in a real app this would be stored with the trip)
  const getDestinationImage = (country: string): string => {
    const images: Record<string, string> = {
      JPN: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      SGP: "https://images.unsplash.com/photo-1565967511849-76a60a516170?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      KOR: "https://images.unsplash.com/photo-1543470373-e055b73a8f29?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      default: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    };
    
    return images[country] || images.default;
  };

  // Format trip status
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      upcoming: "bg-neutral-100 text-neutral-600",
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600"
    };
    
    return statusClasses[status as keyof typeof statusClasses] || statusClasses.upcoming;
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
      PHP: "₱",
      USD: "$",
      EUR: "€",
      JPY: "¥",
      SGD: "S$",
      KRW: "₩",
      THB: "฿"
    };
    
    return symbols[currency] || currency;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative h-40">
        <img
          src={getDestinationImage(trip.destinationCountry)}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full p-2 text-primary">
          <i className="fas fa-heart"></i>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{trip.name}</h3>
          <span className={`text-xs ${getStatusBadge(trip.status)} px-2 py-1 rounded-full`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-neutral-500 mb-3">
          {trip.startDate && trip.endDate 
            ? generateDateRangeText(trip.startDate, trip.endDate)
            : `${trip.duration} days`}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <i className={`fas fa-${getCurrencySymbol(trip.currency) === trip.currency ? 'money-bill-alt' : getCurrencySymbol(trip.currency)} text-neutral-400 mr-1`}></i>
            <span className="text-sm text-neutral-600">{formatCurrency(trip.budget, trip.currency)}</span>
          </div>
          <Link href={`${Routes.TRIP_DETAILS}/${trip.id}`}>
            <button className="text-primary hover:text-primary-dark text-sm font-medium">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
