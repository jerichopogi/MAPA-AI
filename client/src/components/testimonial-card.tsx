import { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-neutral-100">
      <div className="flex items-center mb-4">
        <div className="text-yellow-400 flex">
          {[...Array(5)].map((_, i) => (
            <i key={i} className="fas fa-star"></i>
          ))}
        </div>
      </div>
      <p className="text-neutral-600 mb-4 font-serif italic">
        "{testimonial.quote}"
      </p>
      <div className="flex items-center">
        <img 
          src={testimonial.image} 
          alt={testimonial.name} 
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h4 className="font-medium">{testimonial.name}</h4>
          <p className="text-sm text-neutral-500">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
