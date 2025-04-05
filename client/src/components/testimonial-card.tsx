import { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-neutral-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <div className="text-[#EAB308] flex">
          {[...Array(5)].map((_, i) => (
            <i key={i} className="fas fa-star"></i>
          ))}
        </div>
      </div>
      <p className="text-neutral-600 dark:text-gray-300 mb-4 font-serif italic">
        "{testimonial.quote}"
      </p>
      <div className="flex items-center">
        <img 
          src={testimonial.image} 
          alt={testimonial.name} 
          className="w-10 h-10 rounded-full mr-3 border-2 border-[#40A9BC]/20"
        />
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">{testimonial.name}</h4>
          <p className="text-sm text-neutral-500 dark:text-gray-400">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
