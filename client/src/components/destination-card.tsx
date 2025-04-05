import { DestinationCard as DestinationCardType } from "@/lib/types";

interface DestinationCardProps {
  destination: DestinationCardType;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-52 overflow-hidden">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 text-white">
          <h3 className="text-xl font-semibold">{destination.name}</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center mb-3">
          <span 
            className={destination.visaType === 'success' 
              ? "bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full" 
              : "bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full"}
          >
            {destination.visaStatus}
          </span>
          <span className="ml-2 text-sm text-neutral-500">
            <i className="fas fa-calendar-alt mr-1"></i> {destination.recommendedDays} days
          </span>
        </div>
        <p className="text-neutral-600 mb-4">
          {destination.description}
        </p>
        <a href="#" className="text-primary font-medium hover:text-primary-dark inline-flex items-center">
          View Itineraries
          <i className="fas fa-chevron-right ml-2 text-xs"></i>
        </a>
      </div>
    </div>
  );
};

export default DestinationCard;
