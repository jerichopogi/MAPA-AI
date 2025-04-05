import { Feature } from "@/lib/types";

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
        <i className={`fas fa-${feature.icon} text-2xl`}></i>
      </div>
      <h3 className="text-xl font-semibold font-sans mb-3">{feature.title}</h3>
      <p className="text-neutral-600">
        {feature.description}
      </p>
    </div>
  );
};

export default FeatureCard;
