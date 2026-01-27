import { Users, Wallet, TrendingUp, Clock } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "15,847",
    label: "Utilisateurs actifs",
    suffix: "+",
  },
  {
    icon: Wallet,
    value: "2.4M",
    label: "Montant total investi",
    prefix: "$",
  },
  {
    icon: TrendingUp,
    value: "890K",
    label: "Gains distribués",
    prefix: "$",
  },
  {
    icon: Clock,
    value: "24h",
    label: "Délai de retrait",
    suffix: " max",
  },
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
